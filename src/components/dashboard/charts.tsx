// Graphiques SVG maison, très légers (aucune bibliothèque).
export interface Bar { label: string; value: number }

export function VerticalBars({ data, title, format = (n: number) => String(n), color = "#047857" }: {
  data: Bar[]; title: string; format?: (n: number) => string; color?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const W = 320, H = 140, pad = 18, bw = (W - pad * 2) / Math.max(1, data.length);
  const step = Math.ceil(data.length / 8);
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="h-auto w-full" role="img" aria-label={title}>
        <title>{title}</title>
        {data.map((d, i) => {
          const h = (d.value / max) * H;
          return (
            <g key={i}>
              <rect x={pad + i * bw + 1} y={H - h} width={Math.max(2, bw - 2)} height={h} rx={2} fill={color}>
                <title>{`${d.label} : ${format(d.value)}`}</title>
              </rect>
              {i % step === 0 && <text x={pad + i * bw + bw / 2} y={H + 14} textAnchor="middle" fontSize="9" fill="#57534e">{d.label}</text>}
            </g>
          );
        })}
        <line x1={pad} x2={W - pad} y1={H} y2={H} stroke="#a8a29e" />
      </svg>
      <figcaption className="sr-only">{data.map((d) => `${d.label} : ${format(d.value)}`).join(", ")}</figcaption>
    </figure>
  );
}

export function HorizontalBars({ data, title, format = (n: number) => String(n) }: { data: Bar[]; title: string; format?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul aria-label={title} className="space-y-2">
      {data.map((d) => (
        <li key={d.label}>
          <div className="flex justify-between text-sm"><span className="truncate pr-2 font-medium">{d.label}</span><span className="font-semibold">{format(d.value)}</span></div>
          <div className="h-3 rounded-full bg-stone-200"><div className="h-3 rounded-full bg-emerald-700" style={{ width: `${(d.value / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}
