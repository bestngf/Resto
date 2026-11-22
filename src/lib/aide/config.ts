// Configuration du centre d'aide.
// Le numero WhatsApp et l'e-mail du support viennent de variables d'environnement
// (aucune valeur par defaut : tant qu'elles sont vides, les boutons de contact sont masques).

export const APP_NAME = "Resto";

import { SUPPORT_EMAIL_ADDRESS, SUPPORT_WHATSAPP_NUMBER } from "@/config/public";
const rawWhatsApp = SUPPORT_WHATSAPP_NUMBER;
/** Numero au format international, chiffres uniquement (ex. 22890000000). */
export const SUPPORT_WHATSAPP = rawWhatsApp.replace(/\D/g, "");
export const SUPPORT_EMAIL = SUPPORT_EMAIL_ADDRESS.trim();

export const hasWhatsApp = SUPPORT_WHATSAPP.length >= 8;
export const hasSupportEmail = SUPPORT_EMAIL.includes("@");

/** Lien wa.me vers le support, avec un message pre-rempli. Null si le numero n'est pas configure. */
export function supportWhatsAppLink(message?: string): string | null {
  if (!hasWhatsApp) return null;
  const text = message ? `?text=${encodeURIComponent(message.slice(0, 500))}` : "";
  return `https://wa.me/${SUPPORT_WHATSAPP}${text}`;
}
