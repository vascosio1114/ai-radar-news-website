import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getUser } from "@/lib/auth/server";

type Props = {
  params: { lang: string };
  searchParams: { next?: string };
};

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  const isEn = params.lang === "en";
  return {
    title: isEn ? "Log in" : "登入",
    description: isEn
      ? "Log in to Radar AI Studio to unlock full articles and premium content."
      : "登入 Radar AI Studio，解鎖完整文章與會員內容。",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function LoginPage({ params, searchParams }: Props) {
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
      <AuthForm mode="login" lang={params.lang} />
    </div>
  );
}
