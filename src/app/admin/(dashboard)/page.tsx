import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Eye,
  GraduationCap,
  Home,
  Newspaper,
  PenLine,
  Send,
  Users,
  Wrench,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { getAdminDashboardStats, getAdminNewsMetrics } from "@/lib/admin-news";
import { cn } from "@/lib/utils";
import { publishAllApproved, regenerateFailedDrafts } from "./news/actions";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Newspaper;
}) {
  return (
    <div className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800/70 dark:bg-ink-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
          {label}
        </span>
        <Icon className="h-4 w-4 text-ink-400 dark:text-ink-500" />
      </div>
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}

function QueueMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white/70 p-3 dark:border-ink-800 dark:bg-ink-950/40">
      <div className="text-xs font-medium uppercase tracking-wider text-ink-500 dark:text-ink-400">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-bold">{value.toLocaleString()}</div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [stats, queue] = await Promise.all([
    getAdminDashboardStats(),
    getAdminNewsMetrics(),
  ]);

  const statsDisplay = [
    { label: "Published Articles", value: stats.articles.toString(), icon: Newspaper },
    { label: "Tools", value: stats.tools.toString(), icon: Wrench },
    { label: "Tutorials", value: stats.tutorials.toString(), icon: GraduationCap },
    { label: "Monthly Views", value: stats.views > 0 ? stats.views.toLocaleString() : "0", icon: Eye },
    { label: "Users", value: stats.users.toString(), icon: Users },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
        Manage manual CMS content and the AI-generated news review workflow.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Link
          href="/admin/articles/new"
          className="group relative overflow-hidden rounded-3xl border border-accent-500/25 bg-gradient-to-br from-ink-950 via-ink-900 to-black p-6 text-white shadow-glow transition hover:-translate-y-0.5 hover:border-accent-400/50"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 translate-x-12 -translate-y-12 rounded-full bg-accent-500/20 blur-3xl transition group-hover:bg-accent-400/25" />
          <div className="relative flex items-start justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-accent-300 ring-1 ring-white/10">
                <PenLine className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent-300/80">
                Manual CMS
              </p>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight">
                Write a manual article
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
                Use the existing article CMS for editorial posts, evergreen explainers, and non-pipeline content.
              </p>
            </div>
            <ArrowRight className="mt-2 h-5 w-5 text-white/50 transition group-hover:translate-x-1 group-hover:text-white" />
          </div>
        </Link>

        <Link
          href="/zh"
          target="_blank"
          className="group rounded-3xl border border-ink-200 bg-white/80 p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-accent-400/50 dark:border-ink-800 dark:bg-ink-950/70"
        >
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-600 dark:text-accent-400">
            <Home className="h-5 w-5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500 dark:text-ink-400">
            Public Site
          </p>
          <h2 className="mt-3 font-display text-xl font-bold tracking-tight">View website</h2>
          <p className="mt-2 text-sm leading-6 text-ink-500 dark:text-ink-400">
            Open the public AI Radar Hub site in a new tab.
          </p>
        </Link>
      </div>

      <section className="mt-8 rounded-3xl border border-ink-200/70 bg-white p-6 shadow-soft dark:border-ink-800/70 dark:bg-ink-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-500/10 text-accent-600 dark:text-accent-400">
              <Bot className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-ink-500 dark:text-ink-400">
              AI News Queue
            </p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight">
              AI-generated article review
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500 dark:text-ink-400">
              Review drafts created by the RSS pipeline before publishing. Manual CMS remains in /admin/articles.
            </p>
          </div>
          <Link href="/admin/news" className={cn(buttonVariants())}>
            Open review queue
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QueueMetric label="Pending drafts" value={queue.pendingDrafts} />
          <QueueMetric label="Approved drafts" value={queue.approvedDrafts} />
          <QueueMetric label="Failed drafts" value={queue.failedDrafts} />
          <QueueMetric label="Raw items waiting" value={queue.rawItemsWaiting} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <form action={publishAllApproved}>
            <Button type="submit" disabled={queue.approvedDrafts === 0}>
              <Send data-icon="inline-start" />
              Publish approved drafts
            </Button>
          </form>
          <form action={regenerateFailedDrafts}>
            <Button type="submit" variant="outline" disabled={queue.failedDrafts === 0}>
              Regenerate failed drafts
            </Button>
          </form>
          <Link href="/admin/agent" className={cn(buttonVariants({ variant: "outline" }))}>
            View raw items
          </Link>
        </div>
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statsDisplay.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  );
}
