"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { btnGhost, btnPrimary, inputCls } from "@/components/dashboard/ui";
import Avatar from "@/components/team/Avatar";
import { db } from "@/lib/dashboard/db";
import { getMyProfile, myRequests, requestJoin, saveMyProfile, uploadAvatar } from "@/lib/team/api";
import { teamError } from "@/lib/team/errors";
import { validPhone } from "@/lib/team/phone";
import WaitingScreen from "./WaitingScreen";

type Phase = "boot" | "login" | "sent" | "code" | "profile" | "status";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function JoinFlow({ invite: initialInvite }: { invite: string }) {
  const [phase, setPhase] = useState<Phase>("boot");
  const [invite, setInvite] = useState(initialInvite);
  const [codeInput, setCodeInput] = useState("");
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [email, setEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
  const [savedPhoto, setSavedPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inviteRef = useRef(invite); inviteRef.current = invite;
  const phaseRef = useRef(phase); phaseRef.current = phase;

  const redirectTo = () => `${location.origin}/rejoindre${inviteRef.current ? `?invite=${encodeURIComponent(inviteRef.current)}` : ""}`;

  const boot = useCallback(async () => {
    // Supabase peut re-signaler « connecté » quand on revient sur l'onglet : on ne remet pas l'écran à zéro en cours de route.
    if (!["boot", "login", "sent"].includes(phaseRef.current)) return true;
    const { data } = await db().auth.getUser();
    const u = data.user;
    if (!u) return false;
    setUser({ id: u.id });
    const [p, reqs] = await Promise.all([getMyProfile(u.id).catch(() => null), myRequests(u.id).catch(() => [])]);
    setName(p?.full_name || String(u.user_metadata?.full_name ?? u.user_metadata?.name ?? ""));
    setPhone(p?.phone ?? ""); setSavedPhoto(p?.photo_url ?? null);
    setPhase(inviteRef.current ? "profile" : reqs.length ? "status" : "code");
    return true;
  }, []);

  useEffect(() => {
    let live = true;
    // Au retour d'un lien magique, la session met un instant à s'ouvrir : on patiente avant d'afficher la connexion.
    const returning = (new URLSearchParams(location.search).get("code") ?? "").length > 24;
    boot().then((ok) => {
      if (!live || ok) return;
      if (returning) setTimeout(() => { if (live) setPhase((p) => (p === "boot" ? "login" : p)); }, 4000);
      else setPhase("login");
    });
    const { data: sub } = db().auth.onAuthStateChange((ev) => { if (ev === "SIGNED_IN") boot(); });
    return () => { live = false; sub.subscription.unsubscribe(); };
  }, [boot]);

  useEffect(() => { if (cooldown <= 0) return; const t = setTimeout(() => setCooldown((c) => c - 1), 1000); return () => clearTimeout(t); }, [cooldown]);
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.url); }, [photo]);

  async function sendLink() {
    setErr("");
    if (!EMAIL.test(email.trim())) return setErr("Écris une adresse e-mail valide (ex. kofi@gmail.com).");
    setBusy(true);
    const { error } = await db().auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: redirectTo(), shouldCreateUser: true } });
    setBusy(false);
    if (error) return setErr("Impossible d'envoyer le lien pour l'instant. Vérifie ta connexion et réessaie.");
    setCooldown(60); setPhase("sent");
  }
  async function google() {
    setErr("");
    const { error } = await db().auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
    if (error) setErr("La connexion Google n'est pas encore disponible. Utilise ton adresse e-mail.");
  }
  function pickPhoto(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setErr("Choisis une photo (image).");
    setErr(""); setPhoto({ file: f, url: URL.createObjectURL(f) });
  }

  async function submit() {
    setErr("");
    if (!user) return;
    if (name.trim().length < 2) return setErr("Écris ton nom.");
    if (!validPhone(phone)) return setErr("Écris ton numéro de téléphone (ex. 90 00 00 00).");
    setBusy(true);
    try {
      let photo_url: string | undefined;
      if (photo) { try { photo_url = await uploadAvatar(user.id, photo.file); } catch { /* photo facultative : on continue sans */ } }
      await saveMyProfile({ id: user.id, full_name: name.trim(), phone: phone.trim(), photo_url });
      await requestJoin(invite);
      setPhase("status");
    } catch (e) { setErr(teamError(e)); } finally { setBusy(false); }
  }

  const shell = (children: ReactNode) => (
    <main className="mx-auto max-w-md px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <p className="text-xl font-bold">Resto <span aria-hidden>🍽️</span></p>
        <Link href="/aide?page=rejoindre" className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 bg-white px-3 text-sm font-semibold">❓ Besoin d&apos;aide ?</Link>
      </header>
      {children}
    </main>
  );
  const card = "team-fade rounded-2xl bg-white p-6 shadow-sm";
  const errBox = err ? <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-900">{err}</p> : null;

  if (phase === "boot") return shell(<div className={card} aria-busy="true" role="status"><div className="h-6 w-2/3 animate-pulse rounded bg-stone-200" /><div className="mt-3 h-12 animate-pulse rounded bg-stone-200" /></div>);

  if (phase === "login" || phase === "sent") return shell(
    <section className={card}>
      <p className="text-4xl" aria-hidden><span className="team-wave">👋</span></p>
      <h1 className="mt-2 text-2xl font-bold">{invite ? "Tu as été invité à rejoindre une équipe" : "Rejoindre une équipe"}</h1>
      {phase === "sent" ? (
        <div className="mt-4" aria-live="polite">
          <p className="text-lg font-semibold">📬 Regarde ta boîte mail</p>
          <p className="mt-1 text-sm text-stone-700">Nous avons envoyé un lien à <strong>{email.trim()}</strong>. Touche-le pour continuer. Pense à regarder dans les spams.</p>
          <button type="button" disabled={cooldown > 0 || busy} onClick={sendLink} className={`${btnGhost} mt-4 w-full`}>{cooldown > 0 ? `Renvoyer le lien (${cooldown} s)` : "Renvoyer le lien"}</button>
          <button type="button" onClick={() => { setPhase("login"); setErr(""); }} className="mt-2 min-h-11 w-full text-sm font-semibold underline">Changer d&apos;adresse e-mail</button>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-stone-700">Connecte-toi sans mot de passe. Ensuite tu crées ton profil et tu envoies ta demande : ton patron la valide.</p>
          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-semibold">Ton adresse e-mail</span>
            <input className={inputCls} type="email" inputMode="email" autoComplete="email" placeholder="kofi@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendLink()} />
          </label>
          <button type="button" disabled={busy} onClick={sendLink} className={`${btnPrimary} mt-3 w-full`}>{busy ? "Envoi…" : "Recevoir mon lien de connexion"}</button>
          <p className="my-3 text-center text-sm text-stone-600">ou</p>
          <button type="button" onClick={google} className={`${btnGhost} w-full`}>Continuer avec Google</button>
          {errBox}
          <details className="mt-4 text-sm">
            <summary className="min-h-11 cursor-pointer py-2 font-semibold">Pas d&apos;e-mail ni de compte Google ?</summary>
            <p className="text-stone-700">Tu peux créer gratuitement un compte Gmail depuis ton téléphone (Réglages, puis Comptes, puis Ajouter un compte). Ton patron ou un collègue peut aussi t&apos;aider.</p>
          </details>
        </>
      )}
    </section>
  );

  if (phase === "code") return shell(
    <section className={card}>
      <h1 className="text-2xl font-bold">Rejoindre une équipe</h1>
      <p className="mt-1 text-sm text-stone-700">Demande à ton patron le lien ou le QR code d&apos;invitation. Tu peux aussi écrire ici le code qu&apos;il t&apos;a donné.</p>
      <label className="mt-4 block"><span className="mb-1 block text-sm font-semibold">Code d&apos;invitation</span>
        <input className={inputCls} value={codeInput} onChange={(e) => setCodeInput(e.target.value.trim())} autoCapitalize="none" autoComplete="off" /></label>
      <button type="button" disabled={!/^[A-Za-z0-9_-]{4,64}$/.test(codeInput)} onClick={() => { setInvite(codeInput); setPhase("profile"); }} className={`${btnPrimary} mt-3 w-full`}>Continuer</button>
    </section>
  );

  if (phase === "status" && user) return shell(<WaitingScreen userId={user.id} onJoinAnother={() => { setInvite(""); setCodeInput(""); setErr(""); setPhase("code"); }} />);

  return shell(
    <section className={card}>
      <h1 className="text-2xl font-bold">Ton profil</h1>
      <p className="mt-1 text-sm text-stone-700">Ton patron verra ces informations pour te reconnaître.</p>
      <div className="mt-4 flex items-center gap-3">
        <Avatar name={name} url={photo?.url ?? savedPhoto} size={64} />
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-stone-300 px-4 text-sm font-semibold">
          {photo || savedPhoto ? "Changer la photo" : "Ajouter une photo (facultatif)"}
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickPhoto(e.target.files?.[0])} />
        </label>
      </div>
      <label className="mt-4 block"><span className="mb-1 block text-sm font-semibold">Ton nom</span>
        <input className={inputCls} autoComplete="name" maxLength={80} placeholder="Kofi Mensah" value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label className="mt-3 block"><span className="mb-1 block text-sm font-semibold">Ton téléphone</span>
        <input className={inputCls} inputMode="tel" autoComplete="tel" placeholder="90 00 00 00" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
      {errBox}
      <button type="button" disabled={busy} onClick={submit} className={`${btnPrimary} mt-4 w-full`}>{busy ? "Envoi…" : "Envoyer ma demande"}</button>
      <button type="button" onClick={() => { setInvite(""); setPhase("code"); }} className="mt-2 min-h-11 w-full text-sm font-semibold underline">Utiliser un autre code d&apos;invitation</button>
    </section>
  );
}
