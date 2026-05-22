"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { Upload, X } from "lucide-react";
import Image from "next/image";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

export interface TutorialFormData {
  title: string;
  title_zh: string;
  slug: string;
  level: "新手" | "中級" | "進階";
  duration: string;
  cover_image: string;
  excerpt: string;
  excerpt_zh: string;
  content: string;
  content_zh: string;
  is_published: boolean;
}

interface TutorialFormProps {
  initialData?: Partial<TutorialFormData>;
  onSubmit: (data: TutorialFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const LEVELS = ["新手", "中級", "進階"] as const;

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s一-鿿]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function TutorialForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TutorialFormProps) {
  const [formData, setFormData] = useState<TutorialFormData>({
    title: initialData?.title || "",
    title_zh: initialData?.title_zh || "",
    slug: initialData?.slug || "",
    level: initialData?.level || "新手",
    duration: initialData?.duration || "",
    cover_image: initialData?.cover_image || "",
    excerpt: initialData?.excerpt || "",
    excerpt_zh: initialData?.excerpt_zh || "",
    content: initialData?.content || "",
    content_zh: initialData?.content_zh || "",
    is_published: initialData?.is_published ?? true,
  });

  const [slugEdited, setSlugEdited] = useState(!!initialData?.slug);
  const [uploading, setUploading] = useState(false);

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      ...(!slugEdited ? { slug: generateSlug(title) } : {}),
    }));
  };

  const handleSlugChange = (slug: string) => {
    setSlugEdited(true);
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createSupabaseBrowserClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9.]+/g, "_").replace(/^_+|_+$/g, "");
    const [name, ext] = safeName.split(".");
    const fileName = `${Date.now()}-${name.slice(0, 50)}.${ext}`;

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
        />
      </div>

      {/* Level */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          難度
        </label>
        <select
          value={formData.level}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              level: e.target.value as TutorialFormData["level"],
            }))
          }
          className="mt-1 block w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
        >
          {LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          時長
        </label>
        <input
          type="text"
          value={formData.duration}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, duration: e.target.value }))
          }
          className="mt-1 block w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
          placeholder="例如: 10 分鐘"
        />
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
          rows={2}
          className="mt-1 block w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
          placeholder="教學簡短描述..."
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
            rows={2}
            className="mt-1 block w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
            placeholder="教學中文簡短描述..."
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

      {/* Published Toggle */}
      <div>
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