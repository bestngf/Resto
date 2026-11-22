"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, HelpBubble, PageHeader, Skeleton, btnGhost, btnPrimary, cardCls, inputCls } from "@/components/dashboard/ui";
import { useRestaurant } from "@/components/dashboard/RestaurantProvider";
import { db } from "@/lib/dashboard/db";
import { humanError } from "@/lib/dashboard/errors";
import { toSlug } from "@/lib/dashboard/format";
import { normalizePhone } from "@/lib/orders/whatsapp";

const LocationPicker = dynamic(() => import("@/components/dashboard/LocationPicker"), { ssr: false, loading: () => <Skeleton className="h-64" /> });
const CUISINES = ["Togolaise", "Africaine", "Grillades", "Fast-food", "Pizza", "Café & pâtisserie", "Poisson & fruits de mer", "Autre"];
const STEPS = ["Numéro", "Nom", "Cuisine", "Lieu", "Vérifier"];

export default function InscriptionPage() {
  const router = useRouter();
  const { userId, reload, select } = useRestaurant();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const digits = phone.replace(/\D/g, "");
  const valid = [
    digits.length >= 8 && digits.length <= 15,
    name.trim().length >= 2 && toSlug(name).length >= 3,
    cuisine.length > 0,
    !!pos && landmark.trim().length >= 3,
    true,
  ];

  function locate() {
    if (!navigator.geolocation) return setError("La localisation n'est pas disponible sur cet appareil. Touchez la carte à la place.");
    navigator.geolocation.getCurrentPosition(
      (p) => { setError(null); setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); },
      () => setError("Impossible de vous localiser. Touchez la carte à l'endroit de votre restaurant."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function create() {
    if (!userId || !pos) return;
    setBusy(true); setError(null);
    const base = toSlug(name);
    const wa = normalizePhone(phone);
    for (let attempt = 0; attempt < 4; attempt++) {
      const slug = attempt === 0 ? base : `${base.slice(0, 26)}-${Math.random().toString(36).slice(2, 5)}`;
      const { data, error } = await db().from("resto_restaurants").insert({
        name: name.trim(), slug, owner_id: userId, cuisine, phone: wa, whatsapp: wa,
        address: address.trim() || null, landmark: landmark.trim(), latitude: pos.lat, longitude: pos.lng,
      }).select("id").single();
      if (!error && data) {
        await reload();
        select((data as { id: string }).id);
        router.replace("/dashboard/identite");
        return;
      }
      if (error?.code !== "23505") { setError(humanError(error)); setBusy(false); return; }
    }
    setError("Ce nom est déjà pris. Essayez un nom un peu différent.");
    setBusy(false);
  }

  return (
    <>
      <PageHeader title="Créer mon restaurant" subtitle={`Étape ${step + 1} sur ${STEPS.length} · ${STEPS[step]}`} />
      <div className="mb-4 h-2 rounded-full bg-stone-200" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
        <div className="h-2 rounded-full bg-emerald-700 transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>
      {step === 0 && <HelpBubble id="inscription" title="Bienvenue !">Quelques questions simples, puis votre restaurant est prêt à être personnalisé.</HelpBubble>}

      <section className={`${cardCls} fade-in space-y-4`} key={step}>
        {step === 0 && (
          <Field label="Votre numéro de téléphone" hint="Il servira aussi pour le bouton WhatsApp de votre site. Exemple : 90 12 34 56">
            <input className={inputCls} inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="90 12 34 56" />
          </Field>
        )}
        {step === 1 && (
          <Field label="Nom de votre restaurant" hint={name && toSlug(name).length >= 3 ? `Adresse du site : /r/${toSlug(name)}` : "Au moins 3 lettres"}>
            <input className={inputCls} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="Chez Mama Afi" />
          </Field>
        )}
        {step === 2 && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Type de cuisine</legend>
            <div className="flex flex-wrap gap-2">
              {CUISINES.map((c) => (
                <button key={c} type="button" aria-pressed={cuisine === c} onClick={() => setCuisine(c)}
                  className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${cuisine === c ? "border-emerald-700 bg-emerald-700 text-white" : "border-stone-300 bg-white"}`}>{c}</button>
              ))}
            </div>
          </fieldset>
        )}
        {step === 3 && (
          <>
            <p className="text-sm text-stone-700">Touchez la carte à l&apos;endroit de votre restaurant, ou utilisez votre position. Vous pouvez déplacer le repère.</p>
            <button type="button" className={btnGhost} onClick={locate}>📍 Utiliser ma position</button>
            <LocationPicker lat={pos?.lat ?? null} lng={pos?.lng ?? null} onChange={(lat, lng) => setPos({ lat, lng })} />
            <Field label="Repère écrit" hint="Comme on le dit au quartier : « en face de la pharmacie, derrière le marché »">
              <input className={inputCls} value={landmark} maxLength={200} onChange={(e) => setLandmark(e.target.value)} />
            </Field>
            <Field label="Adresse ou quartier (facultatif)">
              <input className={inputCls} value={address} maxLength={200} onChange={(e) => setAddress(e.target.value)} placeholder="Tokoin, Lomé" />
            </Field>
          </>
        )}
        {step === 4 && (
          <dl className="space-y-2 text-sm">
            <div><dt className="text-stone-600">Restaurant</dt><dd className="font-semibold">{name} · {cuisine}</dd></div>
            <div><dt className="text-stone-600">Téléphone</dt><dd className="font-semibold">{phone}</dd></div>
            <div><dt className="text-stone-600">Lieu</dt><dd className="font-semibold">{landmark}{address ? ` · ${address}` : ""}</dd></div>
            <p className="rounded-lg bg-emerald-50 p-3 text-emerald-950">Ensuite, vous ajouterez votre logo et vos couleurs. Rien n&apos;est visible des clients tant que vous ne mettez pas le restaurant en ligne.</p>
          </dl>
        )}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-900">{error}</p>}
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button className={btnGhost} disabled={step === 0 || busy} onClick={() => { setError(null); setStep(step - 1); }}>← Retour</button>
        {step < STEPS.length - 1
          ? <button className={btnPrimary} disabled={!valid[step]} onClick={() => { setError(null); setStep(step + 1); }}>Continuer →</button>
          : <button className={btnPrimary} disabled={busy} onClick={create}>{busy ? "Création…" : "Créer mon restaurant"}</button>}
      </div>
    </>
  );
}
