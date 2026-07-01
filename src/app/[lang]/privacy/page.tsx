import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static/StaticInfoPage";
import { SITE_EMAIL, SITE_NAME, SITE_URL, type Lang } from "@/lib/site";

type Props = { params: { lang: Lang } };

export function generateMetadata({ params }: Props): Metadata {
  const lang = params.lang === "en" ? "en" : "zh";
  const title = lang === "en" ? "Privacy Policy" : "私隱政策";
  const description =
    lang === "en"
      ? "Radar AI Studio privacy policy and data handling overview."
      : "Radar AI Studio 私隱政策與資料處理說明。";

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/privacy`,
      languages: {
        "zh-HK": `${SITE_URL}/zh/privacy`,
        en: `${SITE_URL}/en/privacy`,
      },
    },
    openGraph: { title: `${title} | ${SITE_NAME}`, description, url: `${SITE_URL}/${lang}/privacy` },
  };
}

export default function PrivacyPage({ params }: Props) {
  const lang = params.lang === "en" ? "en" : "zh";

  if (lang === "en") {
    return (
      <StaticInfoPage
        lang={lang}
        eyebrow="Privacy Policy"
        title="How we handle information on Radar AI Studio."
        description="This page summarises how Radar AI Studio may collect, use and protect user information. It is provided for transparency and will be updated as the platform evolves."
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
            body: `If you have privacy questions, contact ${SITE_EMAIL}. This policy may be revised as new features are added.`,
          },
        ]}
      />
    );
  }

  return (
    <StaticInfoPage
      lang={lang}
      eyebrow="私隱政策"
      title="Radar AI Studio 如何處理網站資料。"
      description="本頁簡述 Radar AI Studio 可能如何收集、使用和保護用戶資料，並會因應平台功能更新而修訂。"
      sections={[
        {
          title: "我們可能收集的資料",
          body: "我們可能收集 newsletter 訂閱電郵、帳戶登入資料，以及用於改善網站體驗的基本分析資料。",
        },
        {
          title: "資料使用方式",
          body: "資料會用於營運網站、寄送用戶要求的電郵、改善內容品質，以及維持平台安全。",
        },
        {
          title: "第三方服務",
          body: "平台可能使用 Supabase、Vercel 和電郵服務供應商，用作網站託管、身份驗證和功能發送。",
        },
        {
          title: "聯絡與更新",
          body: `如有私隱問題，可電郵 ${SITE_EMAIL}。本政策可能會隨新功能加入而更新。`,
        },
      ]}
    />
  );
}
