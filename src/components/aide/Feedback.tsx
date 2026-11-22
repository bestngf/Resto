"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hasWhatsApp, supportWhatsAppLink } from "@/lib/aide/config";
import { sendFeedback, trackView } from "@/lib/aide/data";

const voteKey = (slug: string) => `resto_aide_vote:${slug}`;

type Status = "idle" | "sending" | "yes" | "no";

export function Feedback({ slug, title }: { slug: string; title: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(voteKey(slug));
      if (v === "yes" || v === "no") setStatus(v);
    } catch {
      /* ignore */
    }
  }, [slug]);

  async function vote(helpful: boolean) {
    setStatus("sending");
    setFailed(false);
    const ok = await sendFeedback(slug, helpful);
    if (!ok) {
      setStatus("idle");
      setFailed(true);
      return;
    }
    const value = helpful ? "yes" : "no";
    setStatus(value);
    try {
      localStorage.setItem(voteKey(slug), value);
    } catch {
      /* ignore */
    }
  }

  const wa = supportWhatsAppLink(`Bonjour, je n'ai pas trouvé ma réponse dans l'article « ${title} ».`);

  return (
    <section aria-labelledby="avis-titre" className="rounded-xl border border-stone-200 bg-white p-4">
      {status === "yes" && (
        <p className="text-base font-medium text-emerald-900" role="status">
          Merci ! Content que cela vous ait aidé.
        </p>
      )}
      {status === "no" && (
        <div role="status" className="space-y-3">
          <p className="text-base font-medium text-stone-900">Merci, et désolé que ce guide ne suffise pas.</p>
          <div className="flex flex-wrap gap-2">
            {wa && hasWhatsApp && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white hover:bg-emerald-900"
              >
                Écrire au support sur WhatsApp
              </a>
            )}
            <Link
              href={`/aide/contact?article=${encodeURIComponent(slug)}`}
              className="inline-flex min-h-11 items-center rounded-lg border border-stone-300 px-4 text-sm font-semibold text-stone-800"
            >
              Envoyer un message
            </Link>
          </div>
        </div>
      )}
      {(status === "idle" || status === "sending") && (
        <>
          <h2 id="avis-titre" className="text-base font-semibold text-stone-900">
            Cet article vous a-t-il aidé ?
          </h2>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={status === "sending"}
              onClick={() => vote(true)}
              className="min-h-12 flex-1 rounded-lg border-2 border-emerald-800 px-4 text-base font-semibold text-emerald-900 hover:bg-emerald-50 disabled:opacity-60 sm:flex-none"
            >
              Oui
            </button>
            <button
              type="button"
              disabled={status === "sending"}
              onClick={() => vote(false)}
              className="min-h-12 flex-1 rounded-lg border-2 border-stone-400 px-4 text-base font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-60 sm:flex-none"
            >
              Non
            </button>
          </div>
          {failed && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              Votre avis n&apos;est pas parti. Vérifiez votre connexion et réessayez.
            </p>
          )}
        </>
      )}
    </section>
  );
}

/** Compte une vue par session et par article (echec silencieux). */
export function TrackView({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const key = `resto_aide_seen:${slug}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore : on compte quand meme */
    }
    void trackView(slug);
  }, [slug]);
  return null;
}

/** Bouton « Envoyer a un collegue sur WhatsApp » (lien gratuit wa.me, sans numero). */
export function ShareWhatsApp({ title }: { title: string }) {
  const [href, setHref] = useState(`https://wa.me/?text=${encodeURIComponent(title)}`);
  useEffect(() => {
    setHref(`https://wa.me/?text=${encodeURIComponent(`${title} : ${window.location.href}`)}`);
  }, [title]);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-800 hover:bg-stone-50"
    >
      Envoyer à un collègue sur WhatsApp
    </a>
  );
}
