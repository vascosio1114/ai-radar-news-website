import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static/StaticInfoPage";
import { SITE_EMAIL, SITE_NAME, SITE_URL, type Lang } from "@/lib/site";

type Props = { params: { lang: Lang } };

export function generateMetadata({ params }: Props): Metadata {
  const lang = params.lang === "en" ? "en" : "zh";
  const title = lang === "en" ? "Contact" : "聯絡我們";
  const description =
    lang === "en"
      ? "Contact Radar AI Studio for partnerships, AI tool submissions, feedback and editorial enquiries."
      : "聯絡 Radar AI Studio，提交 AI 工具、合作查詢、內容回饋或編輯建議。";

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/contact`,
      languages: {
        "zh-HK": `${SITE_URL}/zh/contact`,
        en: `${SITE_URL}/en/contact`,
      },
    },
    openGraph: { title: `${title} | ${SITE_NAME}`, description, url: `${SITE_URL}/${lang}/contact` },
  };
}

export default function ContactPage({ params }: Props) {
  const lang = params.lang === "en" ? "en" : "zh";

  if (lang === "en") {
    return (
      <StaticInfoPage
        lang={lang}
        eyebrow="Contact"
        title="Get in touch with the Radar AI Studio team."
        description="For partnerships, product submissions, editorial feedback or technical questions, please contact us by email."
        sections={[
          {
            title: "General enquiries",
            body: `For collaboration, business enquiries or platform questions, email us at ${SITE_EMAIL}.`,
          },
          {
            title: "Submit an AI tool",
            body: "If you are building an AI product and would like it to be reviewed, send us a short description, website link and launch status.",
          },
          {
            title: "Editorial feedback",
            body: "If you notice an error or would like to suggest a topic, please include the article URL and relevant details.",
          },
          {
            title: "Response time",
            body: "We aim to review messages regularly, but response time may vary depending on workload and launch stage.",
          },
        ]}
        cta={{ label: "Email us", href: `mailto:${SITE_EMAIL}` }}
      />
    );
  }

  return (
    <StaticInfoPage
      lang={lang}
      eyebrow="聯絡我們"
      title="聯絡 Radar AI Studio 團隊。"
      description="如有合作查詢、AI 工具提交、內容回饋或技術問題，可以透過電郵聯絡我們。"
      sections={[
        {
          title: "一般查詢",
          body: `合作、商業查詢或平台問題，可電郵至 ${SITE_EMAIL}。`,
        },
        {
          title: "提交 AI 工具",
          body: "如果你正在開發 AI 產品並希望我們評測，請提供簡短介紹、網站連結和發布狀態。",
        },
        {
          title: "內容回饋",
          body: "如果你發現文章錯誤，或想建議新主題，請附上文章網址和相關資料。",
        },
        {
          title: "回覆時間",
          body: "我們會定期查看訊息，但實際回覆時間會視工作量和平台階段而定。",
        },
      ]}
      cta={{ label: "發送電郵", href: `mailto:${SITE_EMAIL}` }}
    />
  );
}
