import type { ReactNode } from "react";
import "@/components/team/team.css";

export const metadata = { title: "Rejoindre l'équipe · Resto", robots: { index: false, follow: false } };

export default function Layout({ children }: { children: ReactNode }) {
  return <div className="team-root min-h-screen bg-stone-100 text-stone-900">{children}</div>;
}
