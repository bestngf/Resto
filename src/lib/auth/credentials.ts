import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/config/public";
import { getSupabase } from "@/lib/supabase/client";

/** E-mail technique invisible pour l'utilisateur (auth Supabase). */
export function authEmailFromUsername(username: string): string {
  return `${username.trim().toLowerCase()}@resto.ngf.local`;
}

const FN_BASE = `${SUPABASE_URL}/functions/v1`;

function anonHeaders(extra?: HeadersInit): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY,
    ...extra,
  };
}

type Json = Record<string, unknown>;

async function postFn<T extends Json>(path: string, body: Json, headers?: HeadersInit): Promise<T> {
  const res = await fetch(`${FN_BASE}${path}`, {
    method: "POST",
    headers: anonHeaders(headers),
    body: JSON.stringify(body),
  });
  let data: T;
  try {
    data = (await res.json()) as T;
  } catch {
    throw new Error("Réponse invalide du serveur. Réessaie dans un instant.");
  }
  return data;
}

export type SignupBody = {
  username: string;
  code: string;
  full_name: string;
  phone?: string;
  role: "client" | "restaurateur";
  recovery_email?: string;
  check_only?: boolean;
};

/** Inscription ou vérification de disponibilité du pseudo. */
export async function restoSignup(body: SignupBody): Promise<{ ok?: boolean; available?: boolean; message?: string }> {
  return postFn("/resto-signup", body);
}

/** Demande d'un nouveau code par e-mail de récupération. */
export async function restoCodeOublie(username: string, email: string): Promise<{ ok?: boolean; message?: string }> {
  return postFn("/resto-code-oublie", { username, email });
}

/** Patron / gérant : refaire le code d'un membre. */
export async function restoCodeReset(userId: string, newCode: string, accessToken: string): Promise<{ ok?: boolean; message?: string }> {
  return postFn(
    "/resto-code-reset",
    { user_id: userId, new_code: newCode },
    { Authorization: `Bearer ${accessToken}` }
  );
}

/** Connexion : nom d'utilisateur + code → session Supabase. */
export async function signInWithUsername(username: string, code: string) {
  return getSupabase().auth.signInWithPassword({
    email: authEmailFromUsername(username),
    password: code,
  });
}

export function safeNext(defaultPath = "/compte"): string {
  if (typeof window === "undefined") return defaultPath;
  const n = new URLSearchParams(window.location.search).get("next") ?? defaultPath;
  return n.startsWith("/") && !n.startsWith("//") ? n : defaultPath;
}
