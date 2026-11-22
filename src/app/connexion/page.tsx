"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientShell from "@/components/layout/ClientShell";
import HelpBubble from "@/components/ui/HelpBubble";
import HelpButton from "@/components/ui/HelpButton";
import { getSupabase } from "@/lib/supabase/client";
import { useSession } from "@/lib/useSession";

// Seuls les chemins internes sont acceptés comme destination.
function safeNext(): string {
  const n = new URLSearchParams(window.location.search).get("next") ?? "/compte";
  return n.startsWith("/") && !n.startsWith("//") ? n : "/compte";
}

export default function Connexion() {
  const router = useRouter();
  const { user, ready } = useSession();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (ready && user) router.replace(safeNext()); }, [ready, user, router]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError("Écris une adresse e-mail valide."); return; }
    setBusy(true);
    const { error: err } = await getSupabase().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}${safeNext()}` },
    });
    setBusy(false);
    if (err) { setError("Le lien n'a pas pu être envoyé. Vérifie ton adresse et ta connexion, puis réessaie."); return; }
    setSent(true);
  }

  return (
    <ClientShell>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Connexion</h1>
        <HelpButton topic="client-connexion" />
      </header>
      <HelpBubble id="client-connexion" title="Pas de mot de passe">Entre ton e-mail : tu reçois un lien. Touche-le et tu es connecté.</HelpBubble>
      {sent ? (
        <div role="status" className="r-pop rounded-2xl border border-[var(--r-line)] bg-white p-6 text-center">
          <p className="text-lg font-semibold">Vérifie ta boîte mail</p>
          <p className="mt-2 text-sm text-[var(--r-muted)]">Un lien de connexion a été envoyé à {email.trim()}. Pense à regarder dans les courriers indésirables.</p>
          <button type="button" onClick={() => setSent(false)} className="mt-3 min-h-11 text-sm font-medium underline">Changer d&apos;adresse</button>
        </div>
      ) : (
        <form onSubmit={send} className="space-y-3">
          <label className="block text-sm font-medium">Ton adresse e-mail
            <input type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-[var(--r-line)] bg-white px-4 text-base" />
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm">{error}</p>}
          <button type="submit" disabled={busy} className="min-h-12 w-full rounded-xl bg-[var(--r-brand)] font-semibold text-[var(--r-brand-ink)] disabled:opacity-60">{busy ? "Envoi…" : "Recevoir mon lien"}</button>
        </form>
      )}
    </ClientShell>
  );
}
