-- Agent 2 : favoris du client + dernier numéro mobile money (appliqué sur le projet le 19/11/2026)
create table if not exists public.resto_favorites (
  customer_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  restaurant_id uuid not null references public.resto_restaurants(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, restaurant_id)
);
alter table public.resto_favorites enable row level security;
create policy p_fav_read on public.resto_favorites for select to authenticated using (customer_id = (select auth.uid()));
create policy p_fav_insert on public.resto_favorites for insert to authenticated with check (customer_id = (select auth.uid()));
create policy p_fav_delete on public.resto_favorites for delete to authenticated using (customer_id = (select auth.uid()));
revoke all on public.resto_favorites from anon;
grant select, insert, delete on public.resto_favorites to authenticated;
create index if not exists resto_favorites_restaurant_idx on public.resto_favorites(restaurant_id);

alter table public.resto_profiles add column if not exists last_momo_phone text;
alter table public.resto_profiles drop constraint if exists resto_profiles_momo_chk;
alter table public.resto_profiles add constraint resto_profiles_momo_chk check (last_momo_phone is null or last_momo_phone ~ '^[0-9+ ]{8,16}$');
