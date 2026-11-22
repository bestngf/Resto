import type { Role } from "@/lib/dashboard/types";
export type { Role };
export type MemberStatus = "actif" | "suspendu" | "retire";
export type RequestStatus = "en_attente" | "validee" | "refusee";
export interface Profile { id: string; full_name: string; phone: string | null; photo_url: string | null }
export interface Member { id: string; restaurant_id: string; user_id: string; role: Role; status: MemberStatus; created_at: string; profile?: Profile | null }
export interface StaffRequest {
  id: string; restaurant_id: string; user_id: string; status: RequestStatus;
  role_assigned: Role | null; validated_by: string | null; decided_at: string | null; created_at: string; profile?: Profile | null;
}
export interface MyRequest { id: string; restaurant_id: string; status: RequestStatus; role_assigned: Role | null; created_at: string; restaurantName: string }
export interface AuditRow { id: string; restaurant_id: string | null; actor_id: string | null; action: string; target: string | null; meta: unknown; created_at: string }
