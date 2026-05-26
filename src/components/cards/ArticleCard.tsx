"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Clock, Eye } from "lucide-react";
import type { Article } from "@/types";
import { timeAgo } from "@/lib/utils";
import { getLocalizedContent, getUIStrings, type Lang } from "@/lib/i18n";

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80";

/* ---- Spotlight Card Wrapper ---- */
function SpotlightCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  const spotlightX = useTransform(springX, [-0.5, 0.5], ["-100%", "100%"]);
  const spotlightY = useTransform(springY, [-0.5, 0.5], ["-100%", "100%"]);
  const glowOpacity = useTransform(springX, [-0.5, 0.5], [0, 1]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
      }}
    >
      {/* Spotlight glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(circle 300px at var(--x, 50%) var(--y, 50%), rgba(59,130,246,0.15), transparent 70%)",
          opacity: glowOpacity,
          // Use CSS custom properties updated via style injection
        }}
        injectCSSVariables={{ mouseX, mouseY, spotlightX, spotlightY }}
      />
      {/* Border glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-20 rounded-3xl opacity-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 250px at var(--x, 50%) var(--y, 50%), rgba(59,130,246,0.35), transparent 60%)`,
          opacity: glowOpacity,
        }}
      />
      {/* Track mouse for image parallax */}
      {children}
    </div>
  );
}

// Need to use useMotionValue + useTransform for the image parallax
// Using a wrapper approach with a ref div for mouse tracking
function ParallaxImage({
  src,
  alt,
  fill,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  const translateX = useTransform(springX, [-0.5, 0.5], [-8, 8]);
  const translateY = useTransform(springY, [-0.5, 0.5], [-8, 8]);
  const scale = useTransform(springX, [-0.5, 0.5], [1.02, 1.05]);

  return (
    <motion.div
      className={`relative overflow-hidden ${className || ""}`}
      style={{ scale }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
      }}
    >
      <motion.div
        className="h-full w-full"
        style={{
          x: translateX,
          y: translateY,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill={fill}
          sizes={sizes}
          className="object-cover"
        />
      </motion.div>
    </motion.div>
  );
}

export function ArticleCard({
  article,
  variant = "default",
  lang = "zh",
}: {
  article: Article;
  variant?: "default" | "featured" | "compact";
  lang?: Lang;
}) {
  const localized = getLocalizedContent(article, lang);
  const strings = getUIStrings(lang);
  const href = `/${lang}/news/${article.slug}`;

  /* Spotlight mouse tracking */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  const spotlightBg = useTransform(
    springX,
    [-0.5, 0.5],
    [
      "radial-gradient(circle 300px at 0% 0%, rgba(59,130,246,0.18), transparent 70%)",
      "radial-gradient(circle 300px at 100% 100%, rgba(59,130,246,0.18), transparent 70%)",
    ]
  );
  const glowOpacity = useTransform(springX, [-0.5, 0.5], [0, 1]);

  const imageMouseX = useMotionValue(0);
  const imageMouseY = useMotionValue(0);
  const imageSpringX = useSpring(imageMouseX, { stiffness: 100, damping: 20 });
  const imageSpringY = useSpring(imageMouseY, { stiffness: 100, damping: 20 });
  const imageX = useTransform(imageSpringX, [-0.5, 0.5], [-8, 8]);
  const imageY = useTransform(imageSpringY, [-0.5, 0.5], [-8, 8]);
  const imageScale = useTransform(springX, [-0.5, 0.5], [1.02, 1.05]);

  if (variant === "featured") {
    return (
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-3xl border border-ink-200/70 bg-white dark:border-ink-800/70 dark:bg-ink-900"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          mouseX.set(x);
          mouseY.set(y);
        }}
      >
        {/* Spotlight overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 rounded-3xl opacity-0 transition-opacity duration-300"
          style={{
            background: spotlightBg,
            opacity: glowOpacity,
          }}
        />
        {/* Border glow */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 rounded-3xl opacity-0 transition-opacity duration-300"
          style={{
            boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.5)",
            opacity: glowOpacity,
          }}
        />
        {article.cover_image && (
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <motion.div
              className="h-full w-full"
              style={{ x: imageX, y: imageY, scale: imageScale }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                imageMouseX.set(x);
                imageMouseY.set(y);
              }}
            >
              <Image
                src={article.cover_image || FALLBACK_COVER}
                alt={localized.title}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
        )}
        <div className="relative z-10 absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-accent-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {article.category}
          </span>
          <h3 className="font-display text-2xl font-bold leading-tight text-white md:text-3xl">
            {localized.title}
          </h3>
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-white/80">
            {localized.excerpt}
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs text-white/70">
            <span>{timeAgo(article.published_at)}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {article.reading_time} {strings.minutes}
            </span>
            {article.views ? (
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {article.views.toLocaleString()}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className="group flex gap-4 rounded-2xl border border-transparent p-3 transition hover:border-ink-200 hover:bg-white dark:hover:border-ink-800 dark:hover:bg-ink-900"
      >
        {article.cover_image && (
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
            <Image
              src={article.cover_image || FALLBACK_COVER}
              alt={localized.title}
              fill
              sizes="120px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-xs font-medium text-accent-600 dark:text-accent-400">
            {article.category}
          </div>
          <h4 className="line-clamp-2 text-sm font-semibold leading-snug">
            {localized.title}
          </h4>
          <div className="mt-2 text-xs text-ink-500 dark:text-ink-400">
            {timeAgo(article.published_at)}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-ink-200/70 bg-white dark:border-ink-800/70 dark:bg-ink-900"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
      }}
    >
      {/* Spotlight overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-300"
        style={{
          background: spotlightBg,
          opacity: glowOpacity,
        }}
      />
      {/* Border glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 rounded-2xl opacity-0 transition-opacity duration-300"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(59,130,246,0.4)",
          opacity: glowOpacity,
        }}
      />

      <Link href={href} className="block">
        {article.cover_image && (
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <motion.div
              className="h-full w-full"
              style={{ x: imageX, y: imageY, scale: imageScale }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                imageMouseX.set(x);
                imageMouseY.set(y);
              }}
            >
              <Image
                src={article.cover_image || FALLBACK_COVER}
                alt={localized.title}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </motion.div>
          </div>
        )}
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-accent-500/10 px-2.5 py-0.5 font-semibold text-accent-700 dark:text-accent-400">
              {article.category}
            </span>
            <span className="text-ink-500 dark:text-ink-400">
              {timeAgo(article.published_at)}
            </span>
          </div>
          <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug">
            {localized.title}
          </h3>
          <p className="line-clamp-2 text-sm text-ink-500 dark:text-ink-400">
            {localized.excerpt}
          </p>
          <div className="mt-auto flex items-center justify-between pt-2 text-xs text-ink-500 dark:text-ink-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {article.reading_time} {strings.readTime}
            </span>
            {article.views ? (
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {article.views.toLocaleString()}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </div>
  );
}