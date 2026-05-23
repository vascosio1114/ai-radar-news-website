import { Cpu, Radar, Sparkles } from "lucide-react";

const particles = Array.from({ length: 42 }, (_, i) => ({
  id: i,
  left: `${(i * 17) % 100}%`,
  top: `${(i * 29) % 100}%`,
  size: 2 + ((i * 7) % 5),
  opacity: 0.22 + ((i * 11) % 45) / 100,
}));

export function AISnowSection({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const copy = lang === "zh"
    ? {
        badge: "{copy.badge}",
        title: "持續更新的 AI 訊號流",
        desc: "我們每 12 小時從 AI 實驗室、Reddit、GitHub、arXiv 與科技媒體收集原始訊號，並整理成專題文章、內部儀表板與電子報，協助讀者持續掌握 AI 世界的最新變化。",
        cards: [
          { label: "來源", value: "10", desc: "AI 訊號來源" },
          { label: "更新", value: "12h", desc: "自動擷取" },
          { label: "輸出", value: "文章", desc: "中文解讀" },
        ],
      }
    : {
        badge: "Live AI signal stream",
        title: "A continuously updated AI signal stream",
        desc: "Every 12 hours, we collect raw signals from AI labs, Reddit, GitHub, arXiv and technology media, then turn them into articles, internal dashboards and email briefings.",
        cards: [
          { label: "Sources", value: "10", desc: "AI signal feeds" },
          { label: "Refresh", value: "12h", desc: "auto ingest" },
          { label: "Output", value: "Blog", desc: "analysis" },
        ],
      };
  return (
    <section className="container-page section-pad pt-0">
      <div className="relative overflow-hidden rounded-3xl border border-ink-200/70 bg-ink-950 px-6 py-12 text-white shadow-soft dark:border-ink-800/80 md:px-10 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(59,130,246,.24),transparent_28%),radial-gradient(circle_at_78%_10%,rgba(34,197,94,.18),transparent_26%),linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] bg-[size:34px_34px] opacity-45" />

        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(125,211,252,.85)]"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
            }}
          />
        ))}

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-100 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Live AI signal stream
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
              {copy.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
              {copy.desc}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <SignalCard icon={<Radar className="h-4 w-4" />} {...copy.cards[0]} />
            <SignalCard icon={<Cpu className="h-4 w-4" />} {...copy.cards[1]} />
            <SignalCard icon={<Sparkles className="h-4 w-4" />} {...copy.cards[2]} />
          </div>
        </div>
      </div>
    </section>
  );
}

function SignalCard({
  icon,
  label,
  value,
  desc,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur transition hover:bg-white/[0.1]">
      <div className="flex items-center justify-between text-cyan-100/80">
        <span className="text-[11px] font-semibold uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-white/50">{desc}</div>
    </div>
  );
}
