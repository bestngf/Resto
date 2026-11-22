const bar = "r-pulse rounded-xl bg-neutral-200";
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement">
      <div className={`h-52 w-full ${bar} rounded-none`} />
      <div className="mx-auto max-w-3xl space-y-3 px-4 pt-6">
        <div className={`h-8 w-2/3 ${bar}`} /><div className={`h-4 w-1/2 ${bar}`} />
        <div className={`h-12 w-full ${bar}`} /><div className={`h-24 w-full ${bar}`} />
      </div>
    </div>
  );
}
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return <div className="mx-auto max-w-3xl space-y-3 px-4 pt-6" aria-busy="true">{Array.from({ length: rows }, (_, i) => <div key={i} className={`h-20 w-full ${bar}`} />)}</div>;
}
