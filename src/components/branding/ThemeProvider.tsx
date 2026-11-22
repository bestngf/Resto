import type { CSSProperties, ReactNode } from "react";
import { safeHex } from "@/lib/site/safe";
import { readableOn, textOnWhite } from "./contrast";

const css = `
@keyframes r-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes r-pop{0%{transform:scale(.8);opacity:0}70%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
@keyframes r-pulse{50%{opacity:.45}}
.r-rise{animation:r-rise .45s ease both}.r-pop{animation:r-pop .5s ease both}.r-pulse{animation:r-pulse 1.4s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.r-rise,.r-pop,.r-pulse{animation:none!important}html{scroll-behavior:auto!important}}
`;

/** Applique logo/couleurs du restaurant via variables CSS, avec correction automatique du contraste. */
export default function ThemeProvider({ primary, secondary, children }: { primary: string | null; secondary: string | null; children: ReactNode }) {
  const brand = safeHex(primary, "#c2410c");
  const brand2 = safeHex(secondary, "#1f2937");
  const vars = {
    "--brand": brand, "--on-brand": readableOn(brand), "--brand-text": textOnWhite(brand),
    "--brand2": brand2, "--on-brand2": readableOn(brand2),
    "--brand-soft": `color-mix(in srgb, ${brand} 10%, white)`,
  } as CSSProperties;
  return (
    <div style={vars} className="ngf-light min-h-screen bg-white pb-24 text-[#111] antialiased">
      <style>{css}</style>
      {children}
    </div>
  );
}
