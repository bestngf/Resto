// Contrôle automatique du contraste (WCAG) : si les couleurs du restaurateur sont illisibles, on corrige le texte.
const rgb = (h: string): [number, number, number] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
const lum = ([r, g, b]: [number, number, number]) => {
  const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
export function ratio(a: string, b: string) {
  const [x, y] = [lum(rgb(a)), lum(rgb(b))];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
/** Meilleur texte (blanc ou noir) à poser sur cette couleur de fond. */
export const readableOn = (bg: string) => (ratio(bg, "#ffffff") >= ratio(bg, "#111111") ? "#ffffff" : "#111111");
/** Assombrit la couleur jusqu'à être lisible comme TEXTE sur fond blanc (ratio >= min). */
export function textOnWhite(color: string, min = 4.5) {
  let c = color;
  for (let i = 0; i < 20 && ratio(c, "#ffffff") < min; i++) {
    const [r, g, b] = rgb(c).map((v) => Math.round(v * 0.9));
    c = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
  }
  return c;
}
