import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserWithProfile } from "@/lib/auth/server";
import { Mail, Calendar, User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  return {
    title: params.lang === "en" ? "My Account" : "我的帳戶",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AccountPage({
  params,
}: {
  params: { lang: string };
}) {
  const lang = params.lang === "en" ? "en" : "zh";
  const { user, profile } = await getUserWithProfile();
  if (!user) {
    redirect(`/${lang}/login?next=/${lang}/account`);
  }

  const displayName =
    profile?.display_name ?? user.email?.split("@")[0] ?? "User";
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="container-page section-pad">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {lang === "zh" ? "我的帳戶" : "My Account"}
        </h1>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          {lang === "zh" ? "管理你的個人資料和帳戶設定。" : "Manage your profile and preferences."}
        </p>

        <div className="mt-8 rounded-lg border border-ink-200/70 bg-white p-6 dark:border-ink-800/70 dark:bg-ink-900">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-accent-500 to-accent-700 text-2xl font-bold text-white">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
            <div>
              <div className="font-display text-xl font-semibold">
                {displayName}
              </div>
              <div className="text-sm text-ink-500 dark:text-ink-400">
                {user.email}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-ink-200/70 pt-6 text-sm dark:border-ink-800/70">
            <Row
              icon={<User className="h-4 w-4" />}
              label="Display name"
              value={profile?.display_name ?? "Not set"}
            />
            <Row
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={user.email ?? "Not set"}
            />
            <Row
              icon={<Calendar className="h-4 w-4" />}
              label="Joined"
              value={user.created_at ? formatDate(user.created_at) : "Not available"}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-200/70 bg-white p-5 dark:border-ink-800/70 dark:bg-ink-900">
          <div>
            <div className="font-semibold">{lang === "zh" ? "登出" : "Log out"}</div>
            <div className="text-xs text-ink-500 dark:text-ink-400">
              {lang === "zh" ? "結束目前登入狀態，下次使用需要重新登入。" : "End this session. You will need to log in again next time."}
            </div>
          </div>
          <LogoutButton lang={lang} />
        </div>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-ink-500 dark:text-ink-400">
        {icon}
        <span className="text-xs uppercase tracking-widest">{label}</span>
      </div>
      <span className="truncate">{value}</span>
    </div>
  );
}
