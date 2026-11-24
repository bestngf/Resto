"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientShell from "@/components/layout/ClientShell";
import { getSupabase } from "@/lib/supabase/client";
import { useSession } from "@/lib/useSession";

const inputCls =
  "mt-1 min-h-12 w-full rounded-xl border border-[var(--r-line)] bg-white px-4 text-base";
const btnCls =
  "min-h-12 w-full rounded-xl bg-[var(--r-brand)] font-semibold text-[var(--r-brand-ink)] disabled:opacity-60";

export default function ChangerCodePage() {
  const router = useRouter();
  const { user, ready } = useSession();
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/connexion?next=/changer-code");
  }, [ready, user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (code.length < 6) {
      setError("Le nouveau code doit avoir au moins 6 caractères.");
      return;
    }
    if (code !== confirm) {
      setError("Les deux codes ne sont pas identiques.");
      return;
    }
    setBusy(true);
    const { error: err } = await getSupabase().auth.updateUser({ password: code });
    setBusy(false);
    if (err) {
      setError("Impossible de changer le code. Réessaie.");
      return;
    }
    setOk(true);
  }

  if (!ready) return null;

  return (
    <ClientShell>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Changer mon code</h1>
        <p className="mt-1 text-sm text-[var(--r-muted)]">Choisis un nouveau code secret (6 caractères minimum).</p>
      </header>

      {ok ? (
        <div role="status" className="rounded-2xl border border-[var(--r-line)] bg-white p-6 text-center">
          <p className="text-lg font-semibold">Code mis à jour</p>
          <p className="mt-2 text-sm text-[var(--r-muted)]">Utilise ce nouveau code pour tes prochaines connexions.</p>
          <button type="button" className={`${btnCls} mt-4`} onClick={() => router.push("/compte")}>
            Retour à mon compte
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-[var(--r-line)] bg-white p-5">
          <label className="block text-sm font-medium">
            Nouveau code
            <input type="password" autoComplete="new-password" value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} minLength={6} required />
          </label>
          <label className="block text-sm font-medium">
            Confirmer le code
            <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} minLength={6} required />
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-900">{error}</p>}
          <button type="submit" disabled={busy} className={btnCls}>{busy ? "Enregistrement…" : "Enregistrer"}</button>
        </form>
      )}
    </ClientShell>
  );
}
