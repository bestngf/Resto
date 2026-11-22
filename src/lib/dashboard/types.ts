// Types locaux du dashboard (tables préfixées resto_). Remplaçables par src/types/database.ts (agent 1).
export type Role = "patron" | "gerant" | "serveur" | "cuisinier" | "caissier" | "livreur";
export type OrderStatus = "recue" | "en_preparation" | "prete" | "servie" | "en_route" | "livree" | "annulee";
export type OrderMode = "sur_place" | "emporter" | "livraison";
export type RestaurantStatus = "brouillon" | "actif" | "ferme" | "suspendu";

export interface Restaurant {
  id: string; slug: string; name: string; owner_id: string;
  cuisine: string | null; phone: string | null; whatsapp: string | null;
  address: string | null; landmark: string | null;
  latitude: number | null; longitude: number | null;
  logo_url: string | null; cover_url: string | null;
  primary_color: string | null; secondary_color: string | null;
  currency: string; status: RestaurantStatus;
  accepts_dine_in: boolean; accepts_takeaway: boolean; accepts_delivery: boolean;
}
export interface OrderItem {
  id: string; order_id: string; menu_item_id: string | null; name_snapshot: string;
  unit_price: number; quantity: number; options: unknown; line_total: number;
}
export interface Order {
  id: string; restaurant_id: string; customer_id: string | null; table_id: string | null;
  mode: OrderMode; status: OrderStatus; payment_method: "mobile_money" | "especes";
  payment_status: "en_attente" | "paye" | "echoue" | "annule";
  subtotal: number; delivery_fee: number; total: number;
  delivery_address: string | null; delivery_landmark: string | null;
  delivery_lat: number | null; delivery_lng: number | null;
  note: string | null; created_at: string; updated_at: string;
  resto_order_items: OrderItem[]; resto_tables: { label: string } | null;
}
export interface Category { id: string; restaurant_id: string; name: string; sort: number; active: boolean }
export interface OptionGroup { name: string; choices: string[] }
export interface MenuItem {
  id: string; restaurant_id: string; category_id: string | null; name: string;
  description: string | null; price_fcfa: number; photo_url: string | null;
  available: boolean; options: OptionGroup[]; sort: number; active: boolean;
}
export interface TableRow { id: string; restaurant_id: string; label: string; seats: number; qr_token: string; active: boolean }
export interface Reservation {
  id: string; restaurant_id: string; name: string; phone: string; party_size: number;
  starts_at: string; ends_at: string;
  status: "en_attente" | "confirmee" | "refusee" | "annulee" | "terminee";
  source: "site" | "app" | "assistant_vocal"; note: string | null;
}
export interface DeliveryZone { id: string; restaurant_id: string; name: string; fee_fcfa: number; min_order_fcfa: number; active: boolean }
export interface OpeningHour { id: string; restaurant_id: string; weekday: number; opens: string | null; closes: string | null; closed: boolean }
