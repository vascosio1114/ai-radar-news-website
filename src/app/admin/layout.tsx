import Link from "next/link";
import { LayoutDashboard, Newspaper, Wrench, GraduationCap } from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articles", label: "文章管理", icon: Newspaper },
  { href: "/admin/tools", label: "工具管理", icon: Wrench },
  { href: "/admin/tutorials", label: "教學管理", icon: GraduationCap },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-page py-12">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-1">
          <div className="mb-4 px-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
              Admin
            </span>
          </div>
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-700 transition hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800/60"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}