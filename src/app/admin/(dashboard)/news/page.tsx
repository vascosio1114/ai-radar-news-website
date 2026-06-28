import Link from "next/link";
import { Check, ExternalLink, Eye, Pencil, Send, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  getAdminNewsMetrics,
  getDraftArticles,
  type AdminNewsArticle,
} from "@/lib/admin-news";
import { cn } from "@/lib/utils";
import {
  deleteArticle,
  publishAllApproved,
  publishArticle,
  regenerateFailedDrafts,
  saveArticle,
} from "./actions";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: {
    preview?: string;
    edit?: string;
  };
};

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("zh-Hant-HK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function tagsToText(tags: string[] | null) {
  return (tags ?? []).join(", ");
}

function zhTitle(article: AdminNewsArticle) {
  return article.title_zh || article.title || "Untitled";
}

function enTitle(article: AdminNewsArticle) {
  return article.title_en || "English draft missing";
}

function IdInput({ id }: { id: string }) {
  return <input type="hidden" name="id" value={id} />;
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value.toLocaleString()}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function ArticleActions({ article }: { article: AdminNewsArticle }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/news?preview=${article.id}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <Eye data-icon="inline-start" />
        Preview
      </Link>
      <Link
        href={`/admin/news?edit=${article.id}`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <Pencil data-icon="inline-start" />
        Edit
      </Link>
      <form action={publishArticle}>
        <IdInput id={article.id} />
        <Button size="sm" type="submit">
          <Send data-icon="inline-start" />
          Publish
        </Button>
      </form>
      <form action={deleteArticle}>
        <IdInput id={article.id} />
        <Button variant="destructive" size="sm" type="submit">
          <Trash2 data-icon="inline-start" />
          Delete
        </Button>
      </form>
    </div>
  );
}

function PreviewPanel({ article }: { article: AdminNewsArticle }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{zhTitle(article)}</CardTitle>
        <CardDescription>{article.source_url || "No source URL"}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{article.category}</Badge>
          <Badge variant="outline">{article.language || "zh-Hant,en"}</Badge>
          {article.review_status === "approved" ? (
            <Badge>
              <Check data-icon="inline-start" />
              Approved
            </Badge>
          ) : null}
        </div>
        {article.source_url ? (
          <a
            href={article.source_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink data-icon="inline-start" />
            {article.source_url}
          </a>
        ) : null}
        <Separator />
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="min-w-0">
            <h3 className="mb-2 text-sm font-semibold">中文</h3>
            <p className="mb-4 text-sm text-muted-foreground">{article.excerpt_zh || article.excerpt || "No excerpt"}</p>
            <article className="prose prose-sm max-w-none whitespace-pre-wrap dark:prose-invert">
              {article.content_zh || article.content || "No Chinese content"}
            </article>
          </section>
          <section className="min-w-0">
            <h3 className="mb-2 text-sm font-semibold">English</h3>
            <p className="mb-4 text-sm text-muted-foreground">{article.excerpt_en || "No excerpt"}</p>
            <article className="prose prose-sm max-w-none whitespace-pre-wrap dark:prose-invert">
              {article.content_en || "No English content"}
            </article>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}

function EditPanel({ article }: { article: AdminNewsArticle }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Draft</CardTitle>
        <CardDescription>Save marks the draft as pending or approved for bulk publishing.</CardDescription>
      </CardHeader>
      <form action={saveArticle}>
        <CardContent className="flex flex-col gap-4">
          <IdInput id={article.id} />
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold">中文稿</h3>
              <div className="flex flex-col gap-2">
                <Label htmlFor="title_zh">中文標題</Label>
                <Input id="title_zh" name="title_zh" defaultValue={article.title_zh || article.title} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="excerpt_zh">中文摘要</Label>
                <Textarea id="excerpt_zh" name="excerpt_zh" defaultValue={article.excerpt_zh || article.excerpt || ""} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="content_zh">中文內容</Label>
                <Textarea
                  id="content_zh"
                  name="content_zh"
                  defaultValue={article.content_zh || article.content || ""}
                  className="min-h-80 font-mono"
                  required
                />
              </div>
            </section>
            <section className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold">English Draft</h3>
              <div className="flex flex-col gap-2">
                <Label htmlFor="title_en">English title</Label>
                <Input id="title_en" name="title_en" defaultValue={article.title_en || ""} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="excerpt_en">English excerpt</Label>
                <Textarea id="excerpt_en" name="excerpt_en" defaultValue={article.excerpt_en || ""} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="content_en">English content</Label>
                <Textarea
                  id="content_en"
                  name="content_en"
                  defaultValue={article.content_en || ""}
                  className="min-h-80 font-mono"
                  required
                />
              </div>
            </section>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={article.category} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" defaultValue={tagsToText(article.tags)} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="review_status"
              value="approved"
              defaultChecked={article.review_status === "approved"}
              className="size-4 rounded border-input"
            />
            Approved for &quot;Publish All Approved&quot;
          </label>
        </CardContent>
        <CardFooter>
          <Button type="submit">Save Draft</Button>
          <Link href="/admin/news" className={cn(buttonVariants({ variant: "outline" }))}>
            Cancel
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

export default async function AdminNewsPage({ searchParams }: PageProps) {
  const [articles, metrics] = await Promise.all([
    getDraftArticles(),
    getAdminNewsMetrics(),
  ]);
  const previewArticle = articles.find((article) => article.id === searchParams?.preview);
  const editArticle = articles.find((article) => article.id === searchParams?.edit);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">AI News Queue</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">AI News Review Queue</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Review AI-generated drafts before publishing them to AI Radar Hub.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={publishAllApproved}>
            <Button type="submit" disabled={metrics.approvedDrafts === 0}>
              <Send data-icon="inline-start" />
              Publish approved drafts
            </Button>
          </form>
          <form action={regenerateFailedDrafts}>
            <Button type="submit" variant="outline" disabled={metrics.failedDrafts === 0}>
              Regenerate failed drafts
            </Button>
          </form>
          <Link href="/admin/agent" className={cn(buttonVariants({ variant: "outline" }))}>
            View raw items
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pending drafts" value={metrics.pendingDrafts} />
        <MetricCard label="Approved drafts" value={metrics.approvedDrafts} />
        <MetricCard label="Failed drafts" value={metrics.failedDrafts} />
        <MetricCard label="Raw items waiting" value={metrics.rawItemsWaiting} />
      </section>

      {previewArticle ? <PreviewPanel article={previewArticle} /> : null}
      {editArticle ? <EditPanel article={editArticle} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Unpublished AI Articles</CardTitle>
          <CardDescription>{articles.length.toLocaleString()} drafts waiting for review.</CardDescription>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
              No unpublished AI drafts.
            </div>
          ) : (
            <>
              <div className="hidden xl:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Excerpt</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Languages</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="max-w-56 font-medium">
                          <div>{zhTitle(article)}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{enTitle(article)}</div>
                        </TableCell>
                        <TableCell className="max-w-72 text-muted-foreground">
                          <div className="line-clamp-2">{article.excerpt_zh || article.excerpt}</div>
                          <div className="mt-1 line-clamp-2 text-xs">{article.excerpt_en}</div>
                        </TableCell>
                        <TableCell className="max-w-56">
                          {article.source_url ? (
                            <a
                              href={article.source_url}
                              target="_blank"
                              rel="noreferrer"
                              className="line-clamp-2 text-primary hover:underline"
                            >
                              {article.source_url}
                            </a>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{article.category}</TableCell>
                        <TableCell>
                          <div className="flex max-w-48 flex-wrap gap-1">
                            {(article.tags ?? []).map((tag) => (
                              <Badge key={tag} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{formatDateTime(article.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(article.title_zh || article.title) ? <Badge variant="outline">zh</Badge> : null}
                            {article.title_en ? <Badge variant="outline">en</Badge> : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <ArticleActions article={article} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-4 xl:hidden">
                {articles.map((article) => (
                  <Card key={article.id}>
                    <CardHeader>
                      <CardTitle>{zhTitle(article)}</CardTitle>
                      <CardDescription>{article.excerpt_zh || article.excerpt}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{article.category}</Badge>
                        {(article.title_zh || article.title) ? <Badge variant="outline">zh</Badge> : null}
                        {article.title_en ? <Badge variant="outline">en</Badge> : null}
                        {(article.tags ?? []).map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                      <p className="text-muted-foreground">Created: {formatDateTime(article.created_at)}</p>
                      {article.source_url ? (
                        <a
                          href={article.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-primary hover:underline"
                        >
                          {article.source_url}
                        </a>
                      ) : null}
                    </CardContent>
                    <CardFooter>
                      <ArticleActions article={article} />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
