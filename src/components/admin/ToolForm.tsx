"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import dynamic from "next/dynamic";
import { Upload, X } from "lucide-react";

// Dynamically import markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

export interface ToolFormData {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  logo: string;
  website: string;
  category: string;
  rating: number;
  pricing: "free" | "freemium" | "paid";
  is_trending: boolean;
}

interface ToolFormProps {
  initialData?: Partial<ToolFormData>;
  onSubmit: (data: ToolFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CATEGORIES = ["video", "image", "coding", "writing", "productivity"];
const PRICING_OPTIONS = [
  { value: "free", label: "免費" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "付費" },
];

// Generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s一-鿿]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function ToolForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ToolFormProps) {
  const [formData, setFormData] = useState<ToolFormData>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    tagline: initialData?.tagline || "",
    description: initialData?.description || "",
    logo: initialData?.logo || "",
    website: initialData?.website || "",
    category: initialData?.category || "productivity",
    rating: initialData?.rating || 0,
    pricing: initialData?.pricing || "freemium",
    is_trending: initialData?.is_trending || false,
  });

  const [slugEdited, setSlugEdited] = useState(!!initialData?.slug);
  const [uploading, setUploading] = useState(false);

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      ...(!slugEdited ? { slug: generateSlug(name) } : {}),
    }));
  };

  const handleSlugChange = (slug: string) => {
    setSlugEdited(true);
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const supabase = createSupabaseBrowserClient();
    const fileName = `logos/${Date.now()}-${file.name.replace(/\s/g, "-")}`;

    const { data, error } = await supabase.storage
      .from("covers")
      .upload(fileName, file, { upsert: true });

    if (!error && data) {
      const { data: urlData } = supabase.storage
        .from("covers")
        .getPublicUrl(fileName);
      setFormData((prev) => ({ ...prev, logo: urlData.publicUrl }));
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          名稱
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
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

      {/* Tagline */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          標語
        </label>
        <input
          type="text"
          value={formData.tagline}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, tagline: e.target.value }))
          }
          className="mt-1 block w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
          placeholder="一句話描述這個工具"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          詳細描述
        </label>
        <div className="mt-1" data-color-mode="auto">
          <MDEditor
            value={formData.description}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                description: value || "",
              }))
            }
            height={200}
            preview="edit"
          />
        </div>
      </div>

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          Logo
        </label>
        <div className="mt-1 flex gap-3">
          <input
            type="url"
            value={formData.logo}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, logo: e.target.value }))
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
              onChange={handleLogoUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
        {formData.logo && (
          <div className="mt-3">
            <img
              src={formData.logo}
              alt="Logo preview"
              className="h-16 w-16 rounded-lg object-contain border border-ink-200 dark:border-ink-700"
            />
          </div>
        )}
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          官網網址
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, website: e.target.value }))
          }
          className="mt-1 block w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
          required
        />
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

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          評分 (0-5)
        </label>
        <input
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={formData.rating}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              rating: parseFloat(e.target.value) || 0,
            }))
          }
          className="mt-1 block w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
        />
      </div>

      {/* Pricing */}
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-ink-300">
          定價
        </label>
        <select
          value={formData.pricing}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              pricing: e.target.value as ToolFormData["pricing"],
            }))
          }
          className="mt-1 block w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-50"
        >
          {PRICING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Trending Toggle */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_trending}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                is_trending: e.target.checked,
              }))
            }
            className="h-4 w-4 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-ink-700 dark:text-ink-300">
            設為熱門工具
          </span>
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