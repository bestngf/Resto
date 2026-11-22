const formatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "12 mars 2026" : date de derniere mise a jour affichee sous chaque article. */
export function formatDateFr(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : formatter.format(d);
}
