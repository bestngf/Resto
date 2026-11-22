// Types locaux (lecture seule) pour l'espace client.
// Ils reflètent les colonnes réelles de resto_* ; à remplacer par src/types/database.ts quand l'agent 1 l'aura généré.

export type OpeningHour = {
  weekday: number; // à confirmer avec l'agent 1 : 0 = dimanche (convention JS) supposée
  opens: string | null; // "HH:MM:SS"
  closes: string | null;
  closed: boolean;
};

export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  cuisine: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  logo_url: string | null;
  cover_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  currency: string | null;
  accepts_dine_in: boolean;
  accepts_takeaway: boolean;
  accepts_delivery: boolean;
  resto_opening_hours?: OpeningHour[];
};

export type Category = { id: string; restaurant_id: string; name: string; sort: number };

export type MenuItem = {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price_fcfa: number;
  photo_url: string | null;
  available: boolean;
  options: unknown; // forme à confirmer avant l'étape « options de plat »
  sort: number;
};
