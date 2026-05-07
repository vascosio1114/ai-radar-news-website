import { Newspaper, Wrench, GraduationCap, Eye } from "lucide-react";

export default function AdminDashboardPage() {
  // TODO: 連接 Supabase 後讀取真實 stat
  const stats = [
    { label: "文章總數", value: "0", icon: Newspaper },
    { label: "工具總數", value: "0", icon: Wrench },
    { label: "教學總數", value: "0", icon: GraduationCap },
    { label: "本月瀏覽", value: "—", icon: Eye },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
        歡迎返嚟。呢度將顯示網站嘅整體狀態。
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800/70 dark:bg-ink-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
                {s.label}
              </span>
              <s.icon className="h-4 w-4 text-ink-400 dark:text-ink-500" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-ink-300 p-8 text-center text-sm text-ink-500 dark:border-ink-700 dark:text-ink-400">
        Admin CRUD 介面仲未起，下一步用 Supabase Auth + Row Level Security 加入：
        <br />新增 / 編輯 / 刪除文章 + 上傳封面圖 + 工具管理。
      </div>
    </div>
  );
}
