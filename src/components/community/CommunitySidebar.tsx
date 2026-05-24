"use client";

interface TrendingTagsProps {
  tags: string[];
  lang?: "zh" | "en";
}

export function TrendingTags({ tags, lang = "en" }: TrendingTagsProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-ink-600 dark:text-ink-300">{lang === "zh" ? "熱門話題" : "Trending"}</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            className="rounded-full bg-accent-500/10 px-3 py-1 text-xs font-medium text-accent-600 hover:bg-accent-500/20 dark:text-accent-400"
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}

interface ActiveMembersProps {
  members: Array<{ name: string; avatar: string }>;
  lang?: "zh" | "en";
}

export function ActiveMembers({ members, lang = "en" }: ActiveMembersProps) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-ink-600 dark:text-ink-300">{lang === "zh" ? "活躍成員" : "Active Members"}</h3>
      <div className="space-y-2">
        {members.map((m, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-7 w-7 shrink-0 rounded-full bg-ink-200 dark:bg-ink-700" />
            <span className="truncate text-xs text-ink-500 dark:text-ink-400">{m.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommunitySidebar({
  lang = "en",
  tags = ["ChatGPT", "Gemini", "Cursor", "AI Agents", "Midjourney", "LLM"],
  members = [
    { name: "Alex Chen", avatar: "" },
    { name: "Maria Garcia", avatar: "" },
    { name: "James Kim", avatar: "" },
    { name: "Sarah Lee", avatar: "" },
    { name: "David Wu", avatar: "" },
  ],
}: {
  lang?: "zh" | "en";
  tags?: string[];
  members?: Array<{ name: string; avatar: string }>;
}) {
  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-ink-200/70 bg-white p-4 dark:border-ink-800/70 dark:bg-ink-900">
        <TrendingTags tags={tags} lang={lang} />
      </div>
      <div className="rounded-2xl border border-ink-200/70 bg-white p-4 dark:border-ink-800/70 dark:bg-ink-900">
        <ActiveMembers members={members} lang={lang} />
      </div>
    </aside>
  );
}