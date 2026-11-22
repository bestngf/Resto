"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { hasWhatsApp, supportWhatsAppLink } from "@/lib/aide/config";
import { sendMessage } from "@/lib/aide/data";

const MAX = 2000;
const inputClass =
  "min-h-12 w-full rounded-lg border-2 border-stone-300 bg-white px-3 text-base text-stone-900 placeholder:text-stone-500 focus:border-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-700/20";

export function ContactForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [honey, setHoney] = useState("");
  const [articleSlug, setArticleSlug] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const a = new URLSearchParams(window.location.search).get("article") ?? "";
    if (/^[a-z0-9-]{1,120}$/.test(a)) setArticleSlug(a);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (honey) {
      setState("sent"); // robot : on fait semblant, rien n'est envoye
      return;
    }
    if (contact.trim().length < 5) {
      setError("Indiquez un numéro de téléphone ou une adresse e-mail pour que nous puissions vous répondre.");
      return;
    }
    if (message.trim().length < 5) {
      setError("Écrivez votre message (quelques mots suffisent).");
      return;
    }
    setState("sending");
    const result = await sendMessage({ contact: contact.trim(), message: message.trim(), name: name.trim(), articleSlug });
    if (result.ok) setState("sent");
    else {
      setError(result.error);
      setState("idle");
    }
  }

  if (state === "sent") {
    const wa = supportWhatsAppLink("Bonjour, je viens d'envoyer un message depuis le centre d'aide.");
    return (
      <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
        <p className="text-lg font-semibold">Message envoyé. Merci !</p>
        <p className="mt-1 text-base">Nous vous répondons le plus vite possible, par le contact que vous avez indiqué.</p>
        {wa && hasWhatsApp && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white"
          >
            C&apos;est urgent ? Écrire sur WhatsApp
          </a>
        )}
      </div>
    );
  }

  const onChange = (set: (v: string) => void) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(e.target.value);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="c-nom" className="mb-1 block text-sm font-medium text-stone-800">
          Votre nom <span className="font-normal text-stone-500">(facultatif)</span>
        </label>
        <input id="c-nom" type="text" maxLength={80} autoComplete="name" value={name} onChange={onChange(setName)} className={inputClass} />
      </div>
      <div>
        <label htmlFor="c-contact" className="mb-1 block text-sm font-medium text-stone-800">
          Votre téléphone ou votre e-mail
        </label>
        <input
          id="c-contact"
          type="text"
          required
          maxLength={120}
          autoComplete="tel"
          placeholder="Pour que nous puissions vous répondre"
          value={contact}
          onChange={onChange(setContact)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="c-message" className="mb-1 block text-sm font-medium text-stone-800">
          Votre message
        </label>
        <textarea
          id="c-message"
          required
          rows={5}
          maxLength={MAX}
          value={message}
          onChange={onChange(setMessage)}
          placeholder="Expliquez simplement ce qui ne marche pas ou ce que vous cherchez"
          className={`${inputClass} py-3`}
        />
        <p className="mt-1 text-right text-xs text-stone-500">
          {message.length} / {MAX}
        </p>
      </div>
      {/* Champ piege pour les robots : invisible pour les personnes. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Ne pas remplir
          <input type="text" tabIndex={-1} autoComplete="off" value={honey} onChange={onChange(setHoney)} />
        </label>
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="min-h-12 w-full rounded-lg bg-emerald-800 px-5 text-base font-semibold text-white hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-700/30 disabled:opacity-60 sm:w-auto"
      >
        {state === "sending" ? "Envoi en cours…" : "Envoyer le message"}
      </button>
    </form>
  );
}
