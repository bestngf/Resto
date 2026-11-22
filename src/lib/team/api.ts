"use client";
// Tous les appels à la base pour l'équipe, au même endroit. Seules des fonctions SQL et tables existantes (aucun schéma modifié).
import { db, must } from "@/lib/dashboard/db";
import { compressImage } from "@/lib/dashboard/image";
import type { AuditRow, Member, MyRequest, Profile, Role, StaffRequest } from "./types";

// ⚠ Valeurs attendues par validate_staff_request pour p_decision : à confirmer avec l'agent 1 (voir DEMANDES).
export const DECISION = { accept: "validee", refuse: "refusee" } as const;
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

async function rpc(fn: string, args: Record<string, unknown>): Promise<unknown> {
  const { data, error } = await db().rpc(fn, args);
  if (error) throw error;
  return data;
}

export async function fetchProfiles(ids: string[]): Promise<Record<string, Profile>> {
  const uniq = [...new Set(ids.filter(Boolean))];
  if (!uniq.length) return {};
  const { data } = await db().from("resto_profiles").select("id,full_name,phone,photo_url").in("id", uniq);
  return Object.fromEntries(((data ?? []) as Profile[]).map((p) => [p.id, p]));
}

/** Demandes en attente + membres du restaurant, avec le profil de chacun. */
export async function loadTeam(restaurantId: string): Promise<{ requests: StaffRequest[]; members: Member[] }> {
  const [rq, mb] = await Promise.all([
    db().from("resto_staff_requests").select("*").eq("restaurant_id", restaurantId).eq("status", "en_attente").order("created_at", { ascending: true }),
    db().from("resto_restaurant_members").select("*").eq("restaurant_id", restaurantId).order("created_at", { ascending: true }),
  ]);
  const requests = must(rq) as StaffRequest[];
  const members = must(mb) as Member[];
  const profiles = await fetchProfiles([...requests.map((r) => r.user_id), ...members.map((m) => m.user_id)]);
  return {
    requests: requests.map((r) => ({ ...r, profile: profiles[r.user_id] ?? null })),
    members: members.map((m) => ({ ...m, profile: profiles[m.user_id] ?? null })),
  };
}

export const decideRequest = (requestId: string, accept: boolean, role?: Role) =>
  rpc("validate_staff_request", { p_request: requestId, p_decision: accept ? DECISION.accept : DECISION.refuse, ...(accept && role ? { p_role: role } : {}) });
export const changeRole = (memberId: string, role: Role) => rpc("resto_change_role", { p_member: memberId, p_role: role });
export const setMemberStatus = (memberId: string, status: "actif" | "suspendu" | "retire") => rpc("resto_set_member_status", { p_member: memberId, p_status: status });

/** Invitation du restaurant. Format de la réponse non documenté : on lit les noms probables. */
export async function getInvite(restaurantId: string): Promise<{ code: string; active: boolean }> {
  const d = await rpc("resto_get_invite", { p_restaurant: restaurantId });
  const o = obj(d);
  const code = typeof d === "string" ? d : String(o.code ?? o.invite_code ?? "");
  return { code, active: Boolean(o.active ?? o.invite_active ?? true) };
}
export const regenerateInvite = (restaurantId: string) => rpc("resto_regenerate_invite", { p_restaurant: restaurantId });
export const setInviteActive = (restaurantId: string, active: boolean) => rpc("resto_set_invite_active", { p_restaurant: restaurantId, p_active: active });
export const requestJoin = (code: string) => rpc("resto_request_join", { p_code: code });

export async function getMyProfile(userId: string): Promise<Profile | null> {
  const { data } = await db().from("resto_profiles").select("id,full_name,phone,photo_url").eq("id", userId).maybeSingle();
  return (data as Profile) ?? null;
}
/** N'envoie JAMAIS la colonne « role » (un utilisateur ne doit pas pouvoir se promouvoir). */
export async function saveMyProfile(p: { id: string; full_name: string; phone: string; photo_url?: string }) {
  const row: Record<string, unknown> = { id: p.id, full_name: p.full_name, phone: p.phone };
  if (p.photo_url) row.photo_url = p.photo_url;
  const { error } = await db().from("resto_profiles").upsert(row, { onConflict: "id" });
  if (error) throw error;
}
/** Photo de profil : compressée dans le navigateur, dossier = id de l'utilisateur (bucket « resto-avatars », demandé à l'agent 1). */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const blob = await compressImage(file, 320, 0.8);
  const path = `${userId}/avatar-${Date.now()}.${blob.type === "image/webp" ? "webp" : "jpg"}`;
  const { error } = await db().storage.from("resto-avatars").upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
  if (error) throw error;
  return db().storage.from("resto-avatars").getPublicUrl(path).data.publicUrl;
}

export async function myRequests(userId: string): Promise<MyRequest[]> {
  const { data, error } = await db().from("resto_staff_requests").select("id,restaurant_id,status,role_assigned,created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(10);
  if (error) throw error;
  const rows = (data ?? []) as Omit<MyRequest, "restaurantName">[];
  const ids = [...new Set(rows.map((r) => r.restaurant_id))];
  const names: Record<string, string> = {};
  if (ids.length) {
    // Le nom n'est lisible que pour un restaurant en ligne ; sinon on affiche « ton restaurant ».
    const { data: rs } = await db().from("resto_restaurants").select("id,name").in("id", ids);
    for (const r of (rs ?? []) as { id: string; name: string }[]) names[r.id] = r.name;
  }
  return rows.map((r) => ({ ...r, restaurantName: names[r.restaurant_id] ?? "ton restaurant" }));
}

export async function loadAudit(restaurantId: string): Promise<{ rows: AuditRow[]; names: Record<string, string> }> {
  const { data, error } = await db().from("resto_audit_log").select("*").eq("restaurant_id", restaurantId).order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  const rows = (data ?? []) as AuditRow[];
  const ids = rows.flatMap((r) => [r.actor_id, r.target]).filter((x): x is string => !!x && /^[0-9a-f-]{36}$/i.test(x));
  const profiles = await fetchProfiles(ids);
  return { rows, names: Object.fromEntries(Object.values(profiles).map((p) => [p.id, p.full_name])) };
}
