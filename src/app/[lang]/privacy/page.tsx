import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static/StaticInfoPage";
import type { Lang } from "@/lib/site";

type Props = { params: { lang: Lang } };

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: params.lang === "en" ? "Privacy Policy" : "私隱政策",
    description:
      params.lang === "en"
        ? "AI Radar privacy policy and data handling overview."
        : "AI Radar 私隱政策與資料處理說明。",
  };
}

export default function PrivacyPage({ params }: Props) {
  const lang = params.lang === "en" ? "en" : "zh";

  if (lang === "en") {
    return (
      <StaticInfoPage
        lang={lang}
        eyebrow="Privacy Policy"
        title="How we handle information on AI Radar."
        description="This page summarises how AI Radar may collect, use and protect user information. It is provided for transparency and will be updated as the platform evolves."
        sections={[
          {
            title: "Information we collect",
            body: "We may collect information such as email addresses for newsletter subscriptions, account details for login features and basic analytics data for improving the site.",
          },
          {
            title: "How we use information",
            body: "Information is used to operate the website, deliver requested emails, improve content and maintain platform security.",
          },
          {
            title: "Third-party services",
            body: "The platform may use services such as Supabase, Vercel and email providers to host, authenticate and deliver website functionality.",
          },
          {
            title: "Contact and updates",
            body: "If you have privacy questions, contact airadar.team@gmail.com. This policy may be revised as new features are added.",
          },
        ]}
      />
    );
  }

  return (
    <StaticInfoPage
      lang={lang}
      eyebrow="私隱政策"
      title="AI Radar 如何處理平台資料。"
      description="本頁概述 AI Radar 可能收集、使用及保護用戶資料的方式，作為平台透明度說明，並會隨功能更新而調整。"
      sections={[
        {
          title: "我們可能收集的資料",
          body: "我們可能會收集電子報訂閱電郵、帳戶登入資料，以及用於改善網站體驗的基本分析資料。",
        },
        {
          title: "資料使用方式",
          body: "相關資料主要用於維持網站運作、發送用戶要求接收的電郵、改善內容品質及保障平台安全。",
        },
        {
          title: "第三方服務",
          body: "平台可能使用 Supabase、Vercel 及電郵服務供應商等第三方服務，以支援託管、認證及郵件發送功能。",
        },
        {
          title: "查詢與更新",
          body: "如有私隱相關查詢，請電郵至 airadar.team@gmail.com。本政策會因應新功能推出而更新。",
        },
      ]}
    />
  );
}
