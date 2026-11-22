-- Retour arriere de 004_aide.sql (ne supprime que les objets de l'agent 6)
drop function if exists public.resto_help_popular(int);
drop function if exists public.resto_help_send_message(text, text, text, text);
drop function if exists public.resto_help_send_feedback(text, boolean);
drop function if exists public.resto_help_track_view(text);
drop table if exists public.resto_help_messages;
drop table if exists public.resto_help_feedback;
drop table if exists public.resto_help_stats;
