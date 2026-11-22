// Types légers pour le site public d'un restaurant (agent 5).
// Volontairement indépendants de src/types/database.ts pour ne pas casser si le schéma évolue.
export type SiteRestaurant = {
  id: string; slug: string; name: string; cuisine: string | null; slogan?: string | null;
  address: string | null; landmark: string | null; latitude: number | null; longitude: number | null;
  logo_url: string | null; cover_url: string | null; primary_color: string | null; secondary_color: string | null;
  currency: string; phone: string | null; whatsapp: string | null; status: string;
  accepts_dine_in: boolean; accepts_takeaway: boolean; accepts_delivery: boolean;
};
export type SiteCategory = { id: string; name: string; sort: number };
export type SiteItem = {
  id: string; name: string; description: string | null; price_fcfa: number; photo_url: string | null;
  category_id: string | null; available: boolean; sort: number;
};
export type SiteHour = { weekday: number; opens: string | null; closes: string | null; closed: boolean };
export type SiteReview = { id: string; rating: number; comment: string | null; created_at: string };
export type SiteZone = { id: string; name: string; fee_fcfa: number; min_order_fcfa: number };
export type OrderMode = "sur_place" | "emporter" | "livraison";
