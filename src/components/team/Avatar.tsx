/* eslint-disable @next/next/no-img-element */
export default function Avatar({ name, url, size = 44 }: { name?: string | null; url?: string | null; size?: number }) {
  const safe = url && /^https:\/\//.test(url) ? url : null; // jamais d'adresse non sécurisée
  const initial = (name || "?").trim().slice(0, 1).toUpperCase() || "?";
  const style = { width: size, height: size };
  return safe ? (
    <img src={safe} alt="" style={style} className="shrink-0 rounded-full bg-stone-200 object-cover" loading="lazy" decoding="async" />
  ) : (
    <span style={style} aria-hidden className="grid shrink-0 place-items-center rounded-full bg-emerald-100 font-bold text-emerald-900">{initial}</span>
  );
}
