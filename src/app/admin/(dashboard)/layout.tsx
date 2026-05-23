import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Newspaper, Wrench, GraduationCap, Bot, Users } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articles", label: "文章管理", icon: Newspaper },
  { href: "/admin/users", label: "User 管理", icon: Users },
  { href: "/admin/agent", label: "Agent 動態", icon: Bot },
  { href: "/admin/tools", label: "工具管理", icon: Wrench },
  { href: "/admin/tutorials", label: "教學管理", icon: GraduationCap },
];

async function checkAuth() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/admin/login");
  }
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAuth();

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
