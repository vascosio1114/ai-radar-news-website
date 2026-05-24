import { NewsFeed } from "@/components/news/NewsFeed";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUIStrings, getLocalizedContent, hasEnglishDisplayContent, type Lang } from "@/lib/i18n";
import { DEFAULT_LANG } from "@/lib/site";

type Props = { params: { lang: string } };

export default async function NewsPage({ params }: Props) {
  const lang = (params.lang as Lang) ?? DEFAULT_LANG;
  const s = getUIStrings(lang);

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("articles_public")
    .select("*")
    .order("published_at", { ascending: false });

  const localized = (data ?? []).map((article) => getLocalizedContent(article, lang));
  const articles = lang === "en"
    ? localized.filter((article) => hasEnglishDisplayContent(article, ["title", "excerpt", "category"]))
    : localized;

  const categories = Array.from(new Set(articles.map((a) => a.category).filter(Boolean))).sort();

  return <NewsFeed articles={articles} lang={lang} categories={categories} s={s} />;
}
