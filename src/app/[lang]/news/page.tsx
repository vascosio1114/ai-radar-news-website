import { NewsFeed } from "@/components/news/NewsFeed";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUIStrings, getLocalizedContent, hasEnglishDisplayContent, type Lang } from "@/lib/i18n";
import { DEFAULT_LANG } from "@/lib/site";

const PAGE_SIZE = 12;

type Props = { params: { lang: string }; searchParams: { page?: string } };

export default async function NewsPage({ params, searchParams }: Props) {
  const lang = (params.lang as Lang) ?? DEFAULT_LANG;
  const s = getUIStrings(lang);

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = createSupabaseServerClient();
  const { count } = await supabase
    .from("articles_public")
    .select("*", { count: "exact", head: true });

  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const { data } = await supabase
    .from("articles_public")
    .select("*")
    .order("published_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  const localized = (data ?? []).map((article) => getLocalizedContent(article, lang));
  const articles = lang === "en"
    ? localized.filter((article) => hasEnglishDisplayContent(article, ["title"]))
    : localized;

  const categories = Array.from(new Set(articles.map((a) => a.category).filter(Boolean))).sort();

  const start = total > 0 ? offset + 1 : 0;
  const end = Math.min(offset + PAGE_SIZE, total);

  return <NewsFeed articles={articles} lang={lang} categories={categories} s={s} page={page} totalPages={totalPages} total={total} start={start} end={end} />;
}
