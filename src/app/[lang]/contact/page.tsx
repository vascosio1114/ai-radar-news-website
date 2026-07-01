import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static/StaticInfoPage";
import type { Lang } from "@/lib/site";

type Props = { params: { lang: Lang } };

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: params.lang === "en" ? "Contact" : "聯絡",
    description:
      params.lang === "en"
        ? "Contact the AI Radar team for partnerships, feedback and editorial enquiries."
        : "聯絡 AI Radar 團隊，洽詢合作、意見回饋與內容查詢。",
  };
}

export default function ContactPage({ params }: Props) {
  const lang = params.lang === "en" ? "en" : "zh";

  if (lang === "en") {
    return (
      <StaticInfoPage
        lang={lang}
        eyebrow="Contact"
        title="Get in touch with the AI Radar team."
        description="For partnerships, product submissions, editorial feedback or technical questions, please contact us by email."
        sections={[
          {
            title: "General enquiries",
            body: "For collaboration, business enquiries or platform questions, email us at airadar.team@gmail.com.",
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
        cta={{ label: "Email us", href: "mailto:airadar.team@gmail.com" }}
      />
    );
  }

  return (
    <StaticInfoPage
      lang={lang}
      eyebrow="聯絡"
      title="聯絡 AI Radar 團隊。"
      description="如有合作洽詢、AI 工具提交、內容意見或技術問題，歡迎透過電郵與我們聯絡。"
      sections={[
        {
          title: "一般查詢",
          body: "如需洽談合作、商務查詢或平台問題，請電郵至 airadar.team@gmail.com。",
        },
        {
          title: "提交 AI 工具",
          body: "如你正在開發 AI 產品並希望被收錄或評測，請提供簡介、官方網站連結與產品狀態。",
        },
        {
          title: "內容回饋",
          body: "如發現文章資料有誤，或希望建議選題，請附上相關文章連結與具體說明。",
        },
        {
          title: "回覆時間",
          body: "我們會定期查看訊息，但實際回覆時間會視乎工作量與平台發展階段而定。",
        },
      ]}
      cta={{ label: "發送電郵", href: "mailto:airadar.team@gmail.com" }}
    />
  );
}
