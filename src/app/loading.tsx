export default function Loading() {
  return (
    <div className="container-page section-pad">
      <div className="space-y-6">
        <div className="h-10 w-1/3 animate-pulse rounded-lg bg-ink-200 dark:bg-ink-800" />
        <div className="h-5 w-2/3 animate-pulse rounded-lg bg-ink-200 dark:bg-ink-800" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl bg-ink-100 dark:bg-ink-800"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
