"use client";
// Client navigateur : session partagée avec tout le site (une seule connexion pour client, restaurateur et équipe).
import { getSupabase } from "@/lib/supabase/client";
export const browserDb = () => getSupabase();
