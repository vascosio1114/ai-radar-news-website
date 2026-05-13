"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";

// Dynamically import markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

export interface ArticleFormData {
  title: string;
  title_zh: string;
  slug: string;
  excerpt: string;
  excerpt_zh: string;
  cover_image: string;
  category: string;
  tags: string[];
  content: string;
  content_zh: string;
  summary_content: string;
  summary_content_zh: string;
  published_at: string;
  is_featured: boolean;
  is_published: boolean;
}

interface ArticleFormProps {
  initialData?: Partial<ArticleFormData>;
  onSubmit: (data: ArticleFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CATEGORIES = [
  "AI 新聞",
  "AI 工具",
  "AI 教程",
  "技術解析",
  "行業觀察",
  "產品評測",
];

// Generate slug from date and title
export function generateSlug(date: string, title: string): string {
  const dateStr = date ? new Date(date).toISOString().split("T")[0] : "";
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s一-鿿]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  return dateStr ? `${dateStr}-${titleSlug}` : titleSlug;
}

export default function ArticleForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ArticleFormProps) {
  const [formData, setFormData] = useState<ArticleFormData>({
    title: initialData?.title || "",
    title_zh: initialData?.title_zh || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    excerpt_zh: initialData?.excerpt_zh || "",
    cover_image: initialData?.cover_image || "",
    category: initialData?.category || CATEGORIES[0],
    tags: initialData?.tags || [],
    content: initialData?.content || "",
    content_zh: initialData?.content_zh || "",
    summary_content: initialData?.summary_content || "",
    summary_content_zh: initialData?.summary_content_zh || "",
    published_at: initialData?.published_at || new Date().toISOString().split("T")[0],
    is_featured: initialData?.is_featured || false,
    is_published: initialData?.is_published ?? true,
  });

  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [slugEdited, setSlugEdited] = useState(!!initialData?.slug);

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      ...(!slugEdited ? { slug: generateSlug(prev.published_at, title) } : {}),
    }));
  };

  const handleDateChange = (published_at: string) => {
    setFormData((prev) => ({
      ...prev,
      published_at,
      ...(!slugEdited ? { slug: generateSlug(published_at, prev.title) } : {}),
    }));
  };

  const handleSlugChange = (slug: string) => {
    setSlugEdited(true);
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createSupabaseBrowserClient();
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;

    const { data, error } = await supabase.storage
      .from("covers")
      .upload(fileName, file, { upsert: true });

    if (!error && data) {
      const { data: urlData } = supabase.storage
        .from("covers")
        .getPublicUrl(fileName);
      setFormData((prev) => ({ ...prev, cover_image: urlData.publicUrl }));
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          標題
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="mt-1 block w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
          required
        />
      </div>

      {/* Published At */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          發佈日期
        </label>
        <input
          type="date"
          value={formData.published_at}
          onChange={(e) => handleDateChange(e.target.value)}
          className="mt-1 block w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          Slug
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          className="mt-1 block w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
          pattern="[a-z0-9-]+"
          placeholder="auto-generated-from-title"
        />
        <p className="mt-1 text-xs text-ink-500">只允許小寫字母、數字和連字符</p>
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          摘要
        </label>
        <textarea
          value={formData.excerpt}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
          }
          rows={3}
          className="mt-1 block w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
          placeholder="文章簡短描述..."
        />
      </div>

      {/* 中文內容 */}
      <div className="border-t border-ink-200 dark:border-ink-700 pt-6">
        <h3 className="text-lg font-medium text-ink-900 dark:text-ink-50 mb-4">中文內容</h3>

        {/* Title Zh */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
            中文標題
          </label>
          <input
            type="text"
            value={formData.title_zh}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title_zh: e.target.value }))
            }
            className="mt-1 block w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
          />
        </div>

        {/* Excerpt Zh */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
            中文摘要
          </label>
          <textarea
            value={formData.excerpt_zh}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, excerpt_zh: e.target.value }))
            }
            rows={3}
            className="mt-1 block w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
            placeholder="文章中文簡短描述..."
          />
        </div>

        {/* Content Zh */}
        <div>
          <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
            中文內容
          </label>
          <div className="mt-1" data-color-mode="auto">
            <MDEditor
              value={formData.content_zh}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, content_zh: value || "" }))
              }
              height={400}
              preview="edit"
            />
          </div>
        </div>

        {/* Summary Content Zh */}
        <div>
          <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
            中文摘要內容
          </label>
          <div className="mt-1" data-color-mode="auto">
            <MDEditor
              value={formData.summary_content_zh}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, summary_content_zh: value || "" }))
              }
              height={400}
              preview="edit"
            />
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          封面圖
        </label>
        <div className="mt-1 flex gap-3">
          <input
            type="url"
            value={formData.cover_image}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, cover_image: e.target.value }))
            }
            placeholder="https://... 或上傳圖片"
            className="flex-1 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
          />
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800">
            <Upload className="h-4 w-4" />
            {uploading ? "上傳中..." : "上傳"}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
        {formData.cover_image && (
          <div className="mt-3 relative w-full max-w-xs">
            <Image
              src={formData.cover_image}
              alt="Cover preview"
              width={384}
              height={128}
              className="h-32 w-full rounded-lg object-cover border border-ink-200 dark:border-ink-700"
            />
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, cover_image: "" }))
              }
              className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          分類
        </label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, category: e.target.value }))
          }
          className="mt-1 block w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          標籤
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
            placeholder="輸入標籤後按 Enter"
            className="flex-1 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
          >
            添加
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content - Markdown Editor */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          內容
        </label>
        <div className="mt-1" data-color-mode="auto">
          <MDEditor
            value={formData.content}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, content: value || "" }))
            }
            height={400}
            preview="edit"
          />
        </div>
      </div>

      {/* Summary Content - Markdown Editor */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          英文摘要內容
        </label>
        <div className="mt-1" data-color-mode="auto">
          <MDEditor
            value={formData.summary_content}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, summary_content: value || "" }))
            }
            height={400}
            preview="edit"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_featured}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                is_featured: e.target.checked,
              }))
            }
            className="h-4 w-4 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-ink-700 dark:text-ink-300">置頂文章</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_published}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                is_published: e.target.checked,
              }))
            }
            className="h-4 w-4 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-ink-700 dark:text-ink-300">已發佈</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-ink-200 px-6 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {isSubmitting ? "儲存中..." : "儲存"}
        </button>
      </div>
    </form>
  );
}