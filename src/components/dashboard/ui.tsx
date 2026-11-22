"use client";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

export const btn = "inline-flex items-center justify-center gap-2 rounded-xl px-4 min-h-11 text-sm font-semibold transition active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";
export const btnPrimary = `${btn} bg-emerald-700 text-white hover:bg-emerald-800`;
export const btnGhost = `${btn} bg-white text-stone-800 border border-stone-300 hover:bg-stone-50`;
export const btnDanger = `${btn} bg-red-700 text-white hover:bg-red-800`;
export const inputCls = "w-full min-h-11 rounded-xl border border-stone-300 bg-white px-3 text-base text-stone-900 placeholder:text-stone-500 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200";
export const cardCls = "rounded-2xl border border-stone-200 bg-white p-4 shadow-sm";

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
        {subtitle && <p className="text-sm text-stone-600">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

/** Petit mot d'accueil, fermable pour de bon. */
export function HelpBubble({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    try { setHidden(localStorage.getItem(`resto:help:${id}`) === "1"); } catch { setHidden(false); }
  }, [id]);
  if (hidden) return null;
  return (
    <aside role="note" className="fade-in mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
      <p className="font-semibold">👋 {title}</p>
      <div className="mt-1 text-sm">{children}</div>
      <button
        className="mt-3 min-h-11 rounded-lg px-2 text-sm font-semibold underline"
        onClick={() => { try { localStorage.setItem(`resto:help:${id}`, "1"); } catch { /* ignoré */ } setHidden(true); }}
      >
        Compris, ne plus afficher
      </button>
    </aside>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: string; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="fade-in rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
      <div className="text-4xl" aria-hidden>{icon}</div>
      <h2 className="mt-2 text-lg font-semibold text-stone-900">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-stone-600">{text}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export const Skeleton = ({ className = "h-24" }: { className?: string }) => (
  <div className={`animate-pulse rounded-2xl bg-stone-200 ${className}`} aria-hidden />
);

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Chargement">
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} />)}
    </div>
  );
}

export function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900">
      <p className="text-sm font-medium">{message}</p>
      {onRetry && <button className={`${btnGhost} mt-3`} onClick={onRetry}>Réessayer</button>}
    </div>
  );
}

export function ConfirmDialog(props: {
  open: boolean; title: string; text: string; confirmLabel: string; danger?: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (props.open) ref.current?.focus(); }, [props.open]);
  if (!props.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={props.onCancel}>
      <div role="dialog" aria-modal="true" aria-label={props.title} className="fade-in w-full max-w-sm rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold">{props.title}</h2>
        <p className="mt-1 text-sm text-stone-700">{props.text}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className={btnGhost} onClick={props.onCancel}>Non, revenir</button>
          <button ref={ref} className={props.danger ? btnDanger : btnPrimary} onClick={props.onConfirm}>{props.confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="fade-in max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button className="min-h-11 min-w-11 rounded-lg text-xl" aria-label="Fermer" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function useToast() {
  const [msg, setMsg] = useState<{ text: string; tone: "ok" | "err" } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const show = useCallback((text: string, tone: "ok" | "err" = "ok") => {
    setMsg({ text, tone });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 4500);
  }, []);
  const node = msg ? (
    <div role="status" aria-live="polite" className={`fade-in fixed inset-x-4 bottom-20 z-50 mx-auto max-w-md rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg md:bottom-6 ${msg.tone === "ok" ? "bg-emerald-800" : "bg-red-800"}`}>
      {msg.text}
    </div>
  ) : null;
  return { show, node };
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-stone-800">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-600">{hint}</span>}
    </label>
  );
}

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition disabled:opacity-50 ${checked ? "bg-emerald-700" : "bg-stone-400"}`}
    >
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${checked ? "left-7" : "left-1"}`} />
    </button>
  );
}
