export default function ClosedBanner({ title = "Ce restaurant n'est pas disponible pour le moment", text = "Il est peut-être fermé temporairement, ou le lien est incorrect. Réessaie un peu plus tard." }: { title?: string; text?: string }) {
  return (
    <main className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-6 text-center">
      <div className="r-rise">
        <p className="text-5xl" aria-hidden>🍽️</p>
        <h1 className="mt-4 text-xl font-bold">{title}</h1>
        <p className="mt-2 text-neutral-600">{text}</p>
      </div>
    </main>
  );
}
