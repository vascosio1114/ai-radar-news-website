import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getUser } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "註冊",
  description: "免費註冊 AI Radar，解鎖文章全文同 premium 內容。",
};

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: { lang: string };
  searchParams: { next?: string };
}) {
  const user = await getUser();
  const rawNext = searchParams.next;
  const safeNext =
    rawNext && !rawNext.includes("://") && !rawNext.startsWith("data:")
      ? rawNext
      : `/${params.lang}`;
  if (user) {
    redirect(safeNext);
  }

  return (
    <div className="container-page section-pad">
      <AuthForm mode="signup" lang={params.lang} />
    </div>
  );
}
