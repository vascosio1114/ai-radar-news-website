import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  cta = "睇全部",
}: {
  eyebrow?: React.ReactNode;
  title: string;
  description?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && (
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
            <span className="h-px w-6 bg-accent-500" />
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-xl text-sm text-ink-500 dark:text-ink-400 md:text-base">
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex items-center gap-1 text-sm font-medium text-ink-700 transition hover:text-accent-600 dark:text-ink-200 dark:hover:text-accent-400"
        >
          {cta}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
