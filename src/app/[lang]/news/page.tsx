import type { Metadata } from "next";
import { NewsFeed } from "@/components/news/NewsFeed";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUIStrings, getLocalizedContent, type Lang } from "@/lib/i18n";
import { DEFAULT_LANG, SITE_URL } from "@/lib/site";

const PAGE_SIZE = 12;

type Props = { params: { lang: string }; searchParams: { page?: string } };

export function generateMetadata({ params }: Props): Metadata {
  const lang = (params.lang as Lang) ?? DEFAULT_LANG;
  const title = lang === "zh" ? "AI 文章" : "AI Blog";
  const description =
    lang === "zh"
      ? "閱讀最新 AI 趨勢、工具觀察、研究摘要與產業分析，掌握人工智能如何改變工作、創作與商業。"
      : "Read AI trends, tool observations, research summaries, and industry analysis from Radar AI Studio.";
  const path = `/${lang}/news`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: {
        "zh-Hant": `${SITE_URL}/zh/news`,
        en: `${SITE_URL}/en/news`,
      },
    },
    openGraph: { title, description, url: `${SITE_URL}${path}` },
  };
}

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export default async function NewsPage({ params, searchParams }: Props) {
  const lang = (params.lang as Lang) ?? DEFAULT_LANG;
  const s = getUIStrings(lang);

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  if (!hasSupabaseConfig()) {
    return (
      <NewsFeed
        articles={[]}
        lang={lang}
        categories={[]}
        s={s}
        page={page}
        totalPages={0}
        total={0}
        start={0}
        end={0}
      />
    );
  }

  const supabase = createSupabaseServerClient();
  const localizedTitleField = lang === "zh" ? "title_zh" : "title_en";
  const { count } = await supabase
    .from("articles_public")
    .select("*", { count: "exact", head: true })
    .not(localizedTitleField, "is", null);

  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const { data } = await supabase
    .from("articles_public")
    .select("*")
    .not(localizedTitleField, "is", null)
    .order("published_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  const localized = (data ?? []).map((article) => getLocalizedContent(article, lang));
  const articles = localized;

  const categories = Array.from(new Set(articles.map((a) => a.category).filter(Boolean))).sort();

  const start = total > 0 ? offset + 1 : 0;
  const end = Math.min(offset + PAGE_SIZE, total);

  return <NewsFeed articles={articles} lang={lang} categories={categories} s={s} page={page} totalPages={totalPages} total={total} start={start} end={end} />;
}
