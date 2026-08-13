// ROUTE: components/results/ResultsSkeleton.tsx  (NEW FILE)
'use client';

export function ResultsSkeleton() {
  return (
    <div className="flex-1 px-5 py-6 pb-28 animate-pulse">
      <div className="rounded-zadoc border border-zadoc-border bg-white p-5 mb-6">
        <div className="h-4 w-24 bg-zadoc-border rounded mb-3" />
        <div className="h-6 w-40 bg-zadoc-border rounded mb-2" />
        <div className="h-3 w-full bg-zadoc-border rounded" />
      </div>

      <div className="h-4 w-32 bg-zadoc-border rounded mb-3" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-zadoc border border-zadoc-border bg-white p-3">
            <div className="h-20 w-full bg-zadoc-border rounded mb-2" />
            <div className="h-3 w-3/4 bg-zadoc-border rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}