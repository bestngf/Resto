// Schemas legers (aucune image a telecharger) pour illustrer les guides.
// Ils pourront etre remplaces plus tard par de vraies captures d'ecran.
// Utilisation dans un article : une ligne  ::illustration nom

const FLOWS: Record<string, { label: string; steps: string[] }> = {
  inscription: {
    label: "Les étapes pour s'inscrire",
    steps: ["Votre numéro", "Nom du restaurant", "Cuisine et lieu", "Restaurant créé"],
  },
  "flux-commande": {
    label: "Le parcours d'une commande",
    steps: ["Reçue", "En préparation", "Prête", "Servie ou en route"],
  },
  "parcours-qr": {
    label: "Commander avec le QR code de la table",
    steps: ["Scanner le QR code", "Choisir les plats", "Envoyer la commande", "Suivre en direct"],
  },
  equipe: {
    label: "Comment un employé rejoint l'équipe",
    steps: ["Lien ou QR code", "Demande en attente", "Validation et rôle", "Accès à son espace"],
  },
  reservation: {
    label: "Comment réserver une table",
    steps: ["Choisir la date", "Choisir un créneau libre", "Confirmer", "Recevoir la réponse"],
  },
};

function Chevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 rotate-90 text-emerald-700 sm:rotate-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function Flow({ label, steps }: { label: string; steps: string[] }) {
  return (
    <figure className="my-2 rounded-xl border border-stone-200 bg-white p-4">
      <figcaption className="mb-3 text-sm font-medium text-stone-500">{label}</figcaption>
      <ol className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-col items-center gap-2 sm:flex-1 sm:flex-row">
            <span className="flex w-full items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-950 sm:flex-1">
              <span
                aria-hidden="true"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-xs text-white"
              >
                {i + 1}
              </span>
              {s}
            </span>
            {i < steps.length - 1 && <Chevron />}
          </li>
        ))}
      </ol>
    </figure>
  );
}

function Identite() {
  return (
    <figure className="my-2 rounded-xl border border-stone-200 bg-white p-4">
      <figcaption className="mb-3 text-sm font-medium text-stone-500">
        Votre logo et vos couleurs se retrouvent partout
      </figcaption>
      <div className="flex flex-wrap items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-xs font-medium text-stone-500 ring-2 ring-stone-200"
        >
          Logo
        </span>
        <div className="flex gap-2" aria-hidden="true">
          <span className="h-10 w-10 rounded-lg bg-emerald-800" />
          <span className="h-10 w-10 rounded-lg bg-amber-500" />
          <span className="h-10 w-10 rounded-lg bg-stone-100 ring-1 ring-stone-300" />
        </div>
        <p className="min-w-40 flex-1 text-sm text-stone-600">
          Logo, couleurs et devise : le site et l'application de votre restaurant les reprennent automatiquement.
        </p>
      </div>
    </figure>
  );
}

export function Illustration({ name }: { name: string }) {
  if (name === "identite") return <Identite />;
  const flow = FLOWS[name];
  return flow ? <Flow label={flow.label} steps={flow.steps} /> : null;
}
