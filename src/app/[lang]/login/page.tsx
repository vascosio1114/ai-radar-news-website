import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getUser } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "登入",
  description: "登入 AI Radar 解鎖文章全文 + premium 內容。",
};

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: { lang: string };
  searchParams: { next?: string };
}) {
  // 已 login 就 redirect
  const user = await getUser();
  if (user) {
    redirect(searchParams.next || `/${params.lang}`);
  }

  return (
    <div className="container-page section-pad">
      <AuthForm mode="login" lang={params.lang} />
    </div>
  );
}
