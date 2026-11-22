// Squelette de chargement : jamais d'ecran vide.
export default function Loading() {
  return (
    <div className="space-y-4" role="status" aria-label="Chargement de l'aide">
      <div className="h-8 w-2/3 rounded-lg bg-stone-200 motion-safe:animate-pulse" />
      <div className="h-14 w-full rounded-xl bg-stone-200 motion-safe:animate-pulse" />
      <div className="h-24 w-full rounded-xl bg-stone-200 motion-safe:animate-pulse" />
      <div className="h-24 w-full rounded-xl bg-stone-200 motion-safe:animate-pulse" />
    </div>
  );
}
