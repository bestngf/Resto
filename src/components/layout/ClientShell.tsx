import "./client-theme.css";
import BottomNav from "./BottomNav";

// À placer autour des pages client (voir docs/DEMANDES.md).
export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="r-client">
      <main className="mx-auto w-full max-w-2xl px-4 pb-28 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
