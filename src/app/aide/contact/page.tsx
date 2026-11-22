import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/aide/ContactForm";
import { SUPPORT_EMAIL, hasSupportEmail, hasWhatsApp, supportWhatsAppLink } from "@/lib/aide/config";

export const metadata: Metadata = { title: "Contacter le support" };

export default function ContactPage() {
  const wa = supportWhatsAppLink("Bonjour, j'ai besoin d'aide.");
  return (
    <div className="space-y-6">
      <nav aria-label="Fil d'Ariane" className="text-sm text-stone-600">
        <Link href="/aide" className="underline underline-offset-2">Aide</Link>
      </nav>
      <header>
        <h1 className="text-2xl font-semibold text-stone-900 sm:text-3xl">Contacter le support</h1>
        <p className="mt-1 text-stone-600">Posez votre question, une vraie personne vous répond.</p>
      </header>

      {wa && hasWhatsApp && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-14 items-center justify-center rounded-xl bg-emerald-800 px-5 text-base font-semibold text-white hover:bg-emerald-900"
        >
          Écrire sur WhatsApp
        </a>
      )}
      {hasSupportEmail && (
        <p className="text-stone-700">
          Vous pouvez aussi écrire à{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-emerald-800 underline underline-offset-2">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      )}

      <section aria-labelledby="formulaire" className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5">
        <h2 id="formulaire" className="mb-4 text-lg font-semibold text-stone-900">
          Envoyer un message
        </h2>
        <ContactForm />
      </section>
    </div>
  );
}
