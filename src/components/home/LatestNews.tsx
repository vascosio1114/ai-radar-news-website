import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ArticleCard } from "@/components/cards/ArticleCard";
import type { Article } from "@/types";
import { getUIStrings, type Lang } from "@/lib/i18n";

const headerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.12,
      ease: [0.22, 1, 0.36, 1],
      stiffness: 100,
      damping: 20,
    },
  }),
};

export function LatestNews({
  articles,
  lang = "zh",
  featuredOnly = false,
}: {
  articles: Article[];
  lang?: Lang;
  featuredOnly?: boolean;
}) {
  const s = getUIStrings(lang);

  const [featured, ...rest] = articles;

  return (
    <section className="container-page section-pad">
      {/* Animated Section Header */}
      <motion.div
        className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
        variants={headerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <motion.div variants={slideInRight} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          <span className="h-px w-6 bg-accent-500" />
          {s.latestNews}
        </motion.div>
        <motion.h2
          variants={slideInLeft}
          className="font-display text-3xl font-bold tracking-tight md:text-4xl"
        >
          {s.latestNewsTitle}
        </motion.h2>
        {s.latestNewsDesc && (
          <motion.p
            variants={slideInLeft}
            className="mt-2 max-w-xl text-sm text-ink-500 dark:text-ink-400 md:text-base"
          >
            {s.latestNewsDesc}
          </motion.p>
        )}
        {featuredOnly && rest.length > 0 && (
          <motion.div variants={slideInRight}>
            <Link
              href={`/${lang}/news`}
              className="group inline-flex items-center gap-1 text-sm font-medium text-ink-700 transition hover:text-accent-600 dark:text-ink-200 dark:hover:text-accent-400"
            >
              {lang === "zh" ? "查看全部" : "View all"}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </motion.div>
        )}
      </motion.div>

      {featuredOnly ? (
        <div className="mx-auto max-w-5xl">
          {featured ? (
            <motion.div
              custom={0}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <ArticleCard article={featured} variant="featured" lang={lang} />
            </motion.div>
          ) : (
            <motion.div
              custom={0}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-sm text-ink-400"
            >
              {lang === "zh" ? "暫未有已發佈文章。" : "No published articles yet."}
            </motion.div>
          )}
        </div>
      ) : (
        /* Bento Grid Layout */
        <div className="grid gap-6 md:grid-cols-3">
          {/* Featured Article - spans 2 columns */}
          {featured && (
            <motion.div
              custom={0}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="md:col-span-2"
            >
              <ArticleCard article={featured} variant="featured" lang={lang} />
            </motion.div>
          )}

          {/* Side Column - stacked articles */}
          <div className="flex flex-col gap-6">
            {rest.slice(0, 3).map((article, i) => (
              <motion.div
                key={article.id}
                custom={i + 1}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
              >
                <ArticleCard article={article} lang={lang} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}