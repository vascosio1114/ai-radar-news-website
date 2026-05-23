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
      ? "Log in to AI Radar to unlock full articles and premium content."
      : "登入 AI Radar，以解鎖文章全文與 premium 內容。",
  };
}

export default async function LoginPage({ params, searchParams }: Props) {
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
