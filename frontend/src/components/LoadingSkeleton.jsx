function LoadingSkeleton() {
  return (
    <div className="mt-6 space-y-6" aria-live="polite" aria-busy="true">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-5 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-5 w-44 animate-pulse rounded bg-slate-200" />
        <div className="mt-5 space-y-3">
          <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-5 w-48 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-[420px] w-full animate-pulse bg-slate-100" />
      </section>
    </div>
  );
}

export default LoadingSkeleton;
