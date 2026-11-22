// Acces aux donnees du centre d'aide. Utilisable cote serveur et cote navigateur.
// Rien n'est journalise avec des donnees personnelles.

import type { HelpArticle, PopularItem } from "./categories";
import { getHelpClient } from "./supabase";

const COLUMNS = "id, slug, category, title, body, published, updated_at";

/** Tous les articles publies (la RLS ne laisse passer que les publies). */
export async function fetchPublishedArticles(): Promise<HelpArticle[]> {
  const supabase = getHelpClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("resto_help_articles")
    .select(COLUMNS)
    .eq("published", true)
    .order("title", { ascending: true });
  if (error || !data) return [];
  return data as HelpArticle[];
}

export async function fetchArticle(slug: string): Promise<HelpArticle | null> {
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return null;
  const supabase = getHelpClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("resto_help_articles")
    .select(COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as HelpArticle;
}

export async function fetchPopular(limit = 6): Promise<PopularItem[]> {
  const supabase = getHelpClient();
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("resto_help_popular", { p_limit: limit });
  if (error || !Array.isArray(data)) return [];
  return data.map((row: { slug: string; title: string; category: string; views: number | string }) => ({
    slug: row.slug,
    title: row.title,
    category: row.category,
    views: Number(row.views) || 0,
  }));
}

/** Compte une vue (echec silencieux : ne doit jamais gener la lecture). */
export async function trackView(slug: string): Promise<void> {
  const supabase = getHelpClient();
  if (!supabase) return;
  try {
    await supabase.rpc("resto_help_track_view", { p_slug: slug });
  } catch {
    /* ignore */
  }
}

export async function sendFeedback(slug: string, helpful: boolean): Promise<boolean> {
  const supabase = getHelpClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.rpc("resto_help_send_feedback", { p_slug: slug, p_helpful: helpful });
    return !error;
  } catch {
    return false;
  }
}

export type SendMessageResult = { ok: true } | { ok: false; error: string };

const MESSAGE_ERRORS: Record<string, string> = {
  contact_invalide: "Indiquez un numéro de téléphone ou une adresse e-mail pour que nous puissions vous répondre.",
  message_invalide: "Votre message est trop court ou trop long (entre 5 et 2000 caractères).",
  nom_invalide: "Le nom est trop long (80 caractères au maximum).",
  limite_atteinte: "Vous avez envoyé beaucoup de messages. Réessayez dans une heure ou écrivez-nous sur WhatsApp.",
};

export async function sendMessage(input: {
  contact: string;
  message: string;
  name?: string;
  articleSlug?: string;
}): Promise<SendMessageResult> {
  const supabase = getHelpClient();
  if (!supabase) {
    return { ok: false, error: "Le service est momentanément indisponible. Réessayez dans un instant." };
  }
  try {
    const { error } = await supabase.rpc("resto_help_send_message", {
      p_contact: input.contact,
      p_message: input.message,
      p_name: input.name || null,
      p_article_slug: input.articleSlug || null,
    });
    if (!error) return { ok: true };
    const code = Object.keys(MESSAGE_ERRORS).find((c) => error.message?.includes(c));
    return {
      ok: false,
      error: code ? MESSAGE_ERRORS[code] : "Le message n'est pas parti. Vérifiez votre connexion et réessayez.",
    };
  } catch {
    return { ok: false, error: "Le message n'est pas parti. Vérifiez votre connexion et réessayez." };
  }
}
