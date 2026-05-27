import Link from "next/link";
import type { Lang } from "@/lib/site";

type Section = {
  title: string;
  body: string;
  items?: string[];
};

type StaticInfoPageProps = {
  lang: Lang;
  eyebrow: string;
  title: string;
  description: string;
  sections: Section[];
  cta?: {
    label: string;
    href: string;
  };
};

export function StaticInfoPage({
  eyebrow,
  title,
  description,
  sections,
  cta,
}: StaticInfoPageProps) {
  return (
    <main className="container-page section-pad">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent-600 dark:text-accent-400">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink-950 dark:text-white md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 text-base leading-8 text-ink-600 dark:text-ink-300 md:text-lg">
          {description}
        </p>
        {cta ? (
          <Link
            href={cta.href}
            className="mt-8 inline-flex rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-600 dark:bg-white dark:text-ink-950 dark:hover:bg-accent-100"
          >
            {cta.label}
          </Link>
        ) : null}
      </header>

      <section className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-2">
        {sections.map((section) => (
          <article
            key={section.title}
            className="rounded-3xl border border-ink-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-ink-800/70 dark:bg-ink-950/60"
          >
            <h2 className="font-display text-xl font-semibold text-ink-950 dark:text-white">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-600 dark:text-ink-300">
              {section.body}
            </p>
            {section.items?.length ? (
              <ul className="mt-5 space-y-2 text-sm text-ink-600 dark:text-ink-300">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  );
}
