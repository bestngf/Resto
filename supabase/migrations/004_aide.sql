-- Agent 6 : centre d'aide. Statistiques, avis et messages.
-- Projet partage (Stock Connect / AnneA) : tout est prefixe resto_.
-- Ecriture UNIQUEMENT par les fonctions ci-dessous (DML direct revoque), RLS sur chaque table.

create table if not exists public.resto_help_stats (
  slug text primary key,
  views bigint not null default 0,
  helpful_yes bigint not null default 0,
  helpful_no bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.resto_help_feedback (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  helpful boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists resto_help_feedback_slug_idx on public.resto_help_feedback (slug, created_at desc);

create table if not exists public.resto_help_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid(),
  name text check (name is null or char_length(name) <= 80),
  contact text not null check (char_length(contact) between 5 and 120),
  message text not null check (char_length(message) between 5 and 2000),
  article_slug text check (article_slug is null or char_length(article_slug) <= 120),
  status text not null default 'nouveau' check (status in ('nouveau','en_cours','traite')),
  created_at timestamptz not null default now()
);
create index if not exists resto_help_messages_created_idx on public.resto_help_messages (created_at desc);

alter table public.resto_help_stats enable row level security;
alter table public.resto_help_feedback enable row level security;
alter table public.resto_help_messages enable row level security;

-- Lecture et gestion reservees a l'admin NGF (resto_is_admin existe deja dans la base).
create policy p_help_stats_admin on public.resto_help_stats for select using (public.resto_is_admin());
create policy p_help_feedback_admin on public.resto_help_feedback for select using (public.resto_is_admin());
create policy p_help_messages_admin_read on public.resto_help_messages for select using (public.resto_is_admin());
create policy p_help_messages_admin_update on public.resto_help_messages for update using (public.resto_is_admin()) with check (public.resto_is_admin());

revoke all on public.resto_help_stats, public.resto_help_feedback, public.resto_help_messages from anon, authenticated;
grant select on public.resto_help_stats, public.resto_help_feedback to authenticated;
grant select, update on public.resto_help_messages to authenticated;

-- Compter une vue (seulement pour un article publie)
create or replace function public.resto_help_track_view(p_slug text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_slug is null or char_length(p_slug) > 120 then return; end if;
  if not exists (select 1 from resto_help_articles where slug = p_slug and published) then return; end if;
  insert into resto_help_stats(slug, views) values (p_slug, 1)
  on conflict (slug) do update set views = resto_help_stats.views + 1, updated_at = now();
end $$;

-- Avis "utile oui/non" (seulement pour un article publie)
create or replace function public.resto_help_send_feedback(p_slug text, p_helpful boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_slug is null or p_helpful is null or char_length(p_slug) > 120 then
    raise exception 'avis_invalide';
  end if;
  if not exists (select 1 from resto_help_articles where slug = p_slug and published) then
    raise exception 'article_introuvable';
  end if;
  if (select count(*) from resto_help_feedback where created_at > now() - interval '1 hour') > 2000 then
    raise exception 'limite_atteinte';
  end if;
  insert into resto_help_feedback(slug, helpful) values (p_slug, p_helpful);
  insert into resto_help_stats(slug, helpful_yes, helpful_no)
  values (p_slug, case when p_helpful then 1 else 0 end, case when p_helpful then 0 else 1 end)
  on conflict (slug) do update set
    helpful_yes = resto_help_stats.helpful_yes + case when p_helpful then 1 else 0 end,
    helpful_no  = resto_help_stats.helpful_no  + case when p_helpful then 0 else 1 end,
    updated_at = now();
end $$;

-- Message au support (limites de longueur et de frequence)
create or replace function public.resto_help_send_message(p_contact text, p_message text, p_name text default null, p_article_slug text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_uid uuid := auth.uid();
begin
  if p_contact is null or char_length(trim(p_contact)) not between 5 and 120 then raise exception 'contact_invalide'; end if;
  if p_message is null or char_length(trim(p_message)) not between 5 and 2000 then raise exception 'message_invalide'; end if;
  if p_name is not null and char_length(p_name) > 80 then raise exception 'nom_invalide'; end if;
  if v_uid is not null and (select count(*) from resto_help_messages where user_id = v_uid and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'limite_atteinte';
  end if;
  if (select count(*) from resto_help_messages where created_at > now() - interval '1 hour') >= 300 then
    raise exception 'limite_atteinte';
  end if;
  insert into resto_help_messages(user_id, name, contact, message, article_slug)
  values (v_uid, nullif(trim(p_name), ''), trim(p_contact), trim(p_message), left(p_article_slug, 120))
  returning id into v_id;
  return v_id;
end $$;

-- Articles populaires (publies uniquement), tries par vues puis par avis positifs
create or replace function public.resto_help_popular(p_limit int default 6)
returns table (slug text, title text, category text, views bigint)
language sql stable security definer set search_path = public as $$
  select a.slug, a.title, a.category, coalesce(s.views, 0)
  from resto_help_articles a
  left join resto_help_stats s on s.slug = a.slug
  where a.published
  order by coalesce(s.views, 0) desc, coalesce(s.helpful_yes, 0) desc, a.updated_at desc
  limit greatest(1, least(coalesce(p_limit, 6), 20));
$$;

revoke all on function public.resto_help_track_view(text), public.resto_help_send_feedback(text, boolean),
  public.resto_help_send_message(text, text, text, text), public.resto_help_popular(int) from public;
grant execute on function public.resto_help_track_view(text), public.resto_help_send_feedback(text, boolean),
  public.resto_help_send_message(text, text, text, text), public.resto_help_popular(int) to anon, authenticated;
