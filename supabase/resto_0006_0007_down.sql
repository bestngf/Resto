-- Retour arrière des migrations agent 2 (développement uniquement)
drop table if exists public.resto_favorites;
alter table public.resto_profiles drop constraint if exists resto_profiles_momo_chk;
alter table public.resto_profiles drop column if exists last_momo_phone;
