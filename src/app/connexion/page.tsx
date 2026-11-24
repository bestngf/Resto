"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientShell from "@/components/layout/ClientShell";
import HelpBubble from "@/components/ui/HelpBubble";
import HelpButton from "@/components/ui/HelpButton";
import {
  restoCodeOublie,
  restoSignup,
  safeNext,
  signInWithUsername,
} from "@/lib/auth/credentials";
import { useSession } from "@/lib/useSession";

type Mode = "login" | "signup" | "forgot";

const inputCls =
  "mt-1 min-h-12 w-full rounded-xl border border-[var(--r-line)] bg-white px-4 text-base text-[var(--r-ink)]";
const btnCls =
  "min-h-12 w-full rounded-xl bg-[var(--r-brand)] font-semibold text-[var(--r-brand-ink)] disabled:opacity-60";

export default function Connexion() {
  const router = useRouter();
  const { user, ready } = useSession();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"client" | "restaurateur">("client");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace(safeNext());
  }, [ready, user, router]);

  useEffect(() => {
    if (mode !== "signup") return;
    const u = username.trim().toLowerCase();
    if (u.length < 3) {
      setAvailable(null);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await restoSignup({
          username: u,
          code: "xxxxxx",
          full_name: "check",
          role: "client",
          check_only: true,
        });
        if (!cancelled) setAvailable(Boolean(res.available));
      } catch {
        if (!cancelled) setAvailable(null);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [username, mode]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const u = username.trim();
    if (u.length < 2) {
      setError("Écris ton nom d'utilisateur.");
      return;
    }
    if (code.length < 6) {
      setError("Le code doit avoir au moins 6 caractères.");
      return;
    }
    setBusy(true);
    const { error: err } = await signInWithUsername(u, code);
    setBusy(false);
    if (err) {
      setError("Nom d'utilisateur ou code incorrect.");
      return;
    }
    router.replace(safeNext());
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const u = username.trim().toLowerCase();
    if (u.length < 3) {
      setError("Choisis un nom d'utilisateur d'au moins 3 caractères.");
      return;
    }
    if (code.length < 6) {
      setError("Le code secret doit avoir au moins 6 caractères.");
      return;
    }
    if (fullName.trim().length < 2) {
      setError("Écris ton nom complet.");
      return;
    }
    setBusy(true);
    try {
      const body: Parameters<typeof restoSignup>[0] = {
        username: u,
        code,
        full_name: fullName.trim(),
        role,
      };
      if (phone.trim()) body.phone = phone.trim();
      if (recoveryEmail.trim()) body.recovery_email = recoveryEmail.trim();
      const res = await restoSignup(body);
      if (!res.ok) {
        setError(res.message || "Impossible de créer le compte. Réessaie.");
        setBusy(false);
        return;
      }
      const { error: err } = await signInWithUsername(u, code);
      setBusy(false);
      if (err) {
        setError("Compte créé, mais la connexion a échoué. Connecte-toi avec ton nom d'utilisateur et ton code.");
        setMode("login");
        return;
      }
      const dest = role === "restaurateur" ? "/dashboard" : safeNext();
      router.replace(dest);
    } catch {
      setBusy(false);
      setError("Problème de connexion. Réessaie dans un instant.");
    }
  }

  async function onForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const u = username.trim();
    if (u.length < 2) {
      setError("Écris ton nom d'utilisateur.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(forgotEmail.trim())) {
      setError("Écris l'e-mail de récupération que tu as indiqué à l'inscription.");
      return;
    }
    setBusy(true);
    try {
      const res = await restoCodeOublie(u, forgotEmail.trim());
      setBusy(false);
      if (!res.ok) {
        setError(res.message || "Impossible d'envoyer un nouveau code.");
        return;
      }
      setInfo(
        "Si ces informations sont correctes, un nouveau code vient d'être envoyé par e-mail. Connecte-toi avec, puis change-le."
      );
    } catch {
      setBusy(false);
      setError("Problème de connexion. Réessaie dans un instant.");
    }
  }

  return (
    <ClientShell>
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {mode === "login" && "Connexion"}
          {mode === "signup" && "Créer un compte"}
          {mode === "forgot" && "Code oublié"}
        </h1>
        <HelpButton topic="client-connexion" />
      </header>

      <HelpBubble id="client-connexion" title="Nom d'utilisateur + code">
        Tu te connectes avec un nom d&apos;utilisateur et un code secret (pas d&apos;e-mail de connexion).
      </HelpBubble>

      {mode === "login" && (
        <form onSubmit={onLogin} className="r-pop space-y-3 rounded-2xl border border-[var(--r-line)] bg-white p-5">
          <label className="block text-sm font-medium">
            Nom d&apos;utilisateur
            <input type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} required />
          </label>
          <label className="block text-sm font-medium">
            Code secret
            <input type="password" autoComplete="current-password" value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} minLength={6} required />
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-900">{error}</p>}
          {info && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-950">{info}</p>}
          <button type="submit" disabled={busy} className={btnCls}>{busy ? "Connexion…" : "Se connecter"}</button>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-sm">
            <button type="button" className="font-medium underline" onClick={() => { setMode("forgot"); setError(null); setInfo(null); }}>Code oublié ?</button>
            <button type="button" className="font-medium underline" onClick={() => { setMode("signup"); setError(null); setInfo(null); }}>Créer un compte</button>
          </div>
          <p className="text-xs text-[var(--r-muted)]">Pas d&apos;e-mail de récupération ? Demande à ton patron ou gérant de refaire ton code.</p>
        </form>
      )}

      {mode === "signup" && (
        <form onSubmit={onSignup} className="r-pop space-y-3 rounded-2xl border border-[var(--r-line)] bg-white p-5">
          <label className="block text-sm font-medium">
            Nom d&apos;utilisateur
            <input type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} minLength={3} required />
            {checking && <span className="mt-1 block text-xs text-[var(--r-muted)]">Vérification…</span>}
            {!checking && available === true && <span className="mt-1 block text-xs text-emerald-700">Ce pseudo est libre.</span>}
            {!checking && available === false && <span className="mt-1 block text-xs text-red-700">Ce pseudo est déjà pris.</span>}
          </label>
          <label className="block text-sm font-medium">
            Code secret (6 caractères minimum)
            <input type="password" autoComplete="new-password" value={code} onChange={(e) => setCode(e.target.value)} className={inputCls} minLength={6} required />
          </label>
          <label className="block text-sm font-medium">
            Nom complet
            <input type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} required />
          </label>
          <label className="block text-sm font-medium">
            Téléphone <span className="font-normal text-[var(--r-muted)]">(optionnel)</span>
            <input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
          </label>
          <fieldset>
            <legend className="text-sm font-medium">Je suis</legend>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => setRole("client")} className={`min-h-11 flex-1 rounded-xl border px-3 text-sm font-semibold ${role === "client" ? "border-[var(--r-brand)] bg-[var(--r-brand)] text-[var(--r-brand-ink)]" : "border-[var(--r-line)] bg-white"}`}>Client</button>
              <button type="button" onClick={() => setRole("restaurateur")} className={`min-h-11 flex-1 rounded-xl border px-3 text-sm font-semibold ${role === "restaurateur" ? "border-[var(--r-brand)] bg-[var(--r-brand)] text-[var(--r-brand-ink)]" : "border-[var(--r-line)] bg-white"}`}>Restaurateur</button>
            </div>
          </fieldset>
          <label className="block text-sm font-medium">
            E-mail pour récupérer ton code <span className="font-normal text-[var(--r-muted)]">(Gmail…, facultatif)</span>
            <input type="email" autoComplete="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} className={inputCls} />
            <span className="mt-1 block text-xs text-[var(--r-muted)]">Sans e-mail, seul ton patron pourra refaire ton code.</span>
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-900">{error}</p>}
          <button type="submit" disabled={busy || available === false} className={btnCls}>{busy ? "Création…" : "Créer mon compte"}</button>
          <button type="button" className="w-full text-center text-sm font-medium underline" onClick={() => { setMode("login"); setError(null); }}>J&apos;ai déjà un compte</button>
        </form>
      )}

      {mode === "forgot" && (
        <form onSubmit={onForgot} className="r-pop space-y-3 rounded-2xl border border-[var(--r-line)] bg-white p-5">
          <p className="text-sm text-[var(--r-muted)]">Si tu as indiqué un e-mail à l&apos;inscription, on peut t&apos;envoyer un nouveau code. Sinon, demande à ton patron ou gérant de refaire ton code.</p>
          <label className="block text-sm font-medium">
            Nom d&apos;utilisateur
            <input type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} required />
          </label>
          <label className="block text-sm font-medium">
            E-mail de récupération
            <input type="email" autoComplete="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className={inputCls} required />
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-900">{error}</p>}
          {info && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-950">{info}</p>}
          <button type="submit" disabled={busy} className={btnCls}>{busy ? "Envoi…" : "Recevoir un nouveau code"}</button>
          <button type="button" className="w-full text-center text-sm font-medium underline" onClick={() => { setMode("login"); setError(null); setInfo(null); }}>Retour à la connexion</button>
        </form>
      )}
    </ClientShell>
  );
}
