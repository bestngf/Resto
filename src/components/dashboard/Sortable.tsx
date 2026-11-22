"use client";
import { ReactNode, useState } from "react";

interface Ctl { handle: ReactNode; up: () => void; down: () => void; isFirst: boolean; isLast: boolean }

/**
 * Liste réordonnable : glisser-déposer (souris) + boutons ▲▼ (téléphone). Aucune dépendance.
 */
export function SortableList<T extends { id: string }>(props: {
  items: T[]; onReorder: (next: T[]) => void; render: (item: T, ctl: Ctl) => ReactNode; className?: string;
}) {
  const { items, onReorder, render } = props;
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= items.length) return;
    const next = [...items];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onReorder(next);
  };

  return (
    <div className={props.className}>
      {items.map((it, i) => (
        <div
          key={it.id} draggable
          onDragStart={(e) => { setDrag(it.id); e.dataTransfer.effectAllowed = "move"; }}
          onDragOver={(e) => { e.preventDefault(); setOver(it.id); }}
          onDrop={(e) => { e.preventDefault(); const from = items.findIndex((x) => x.id === drag); move(from, i); setDrag(null); setOver(null); }}
          onDragEnd={() => { setDrag(null); setOver(null); }}
          className={`${drag === it.id ? "opacity-50" : ""} ${over === it.id && drag !== it.id ? "ring-2 ring-emerald-500 rounded-2xl" : ""}`}
        >
          {render(it, {
            handle: <span className="cursor-grab select-none px-1 text-xl text-stone-500" aria-hidden title="Glisser pour déplacer">⋮⋮</span>,
            up: () => move(i, i - 1), down: () => move(i, i + 1), isFirst: i === 0, isLast: i === items.length - 1,
          })}
        </div>
      ))}
    </div>
  );
}

export function MoveButtons({ ctl, label }: { ctl: { up: () => void; down: () => void; isFirst: boolean; isLast: boolean }; label: string }) {
  const cls = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-stone-300 bg-white text-sm disabled:opacity-30";
  return (
    <span className="inline-flex gap-1">
      <button type="button" className={cls} disabled={ctl.isFirst} onClick={ctl.up} aria-label={`Monter ${label}`}>▲</button>
      <button type="button" className={cls} disabled={ctl.isLast} onClick={ctl.down} aria-label={`Descendre ${label}`}>▼</button>
    </span>
  );
}
