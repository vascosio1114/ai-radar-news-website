"use client";

import { useState, useEffect, useRef } from "react";
import { X, Image as ImageIcon, Link as LinkIcon, Loader2, ExternalLink } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface LinkPreviewData {
  title: string | null;
  description: string | null;
  image: string | null;
}

export function NewThreadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Form state
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkPreview, setLinkPreview] = useState<LinkPreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check auth on mount
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then((res) => {
      setUser(res.data.user ?? null);
      setCheckingAuth(false);
    });
  }, []);

  // Debounced link preview fetch
  useEffect(() => {
    if (!linkUrl) {
      setLinkPreview(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    let normalizedUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      setLinkPreview(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const res = await fetch(`/api/community/link-preview?url=${encodeURIComponent(normalizedUrl)}`);
        if (res.ok) {
          const data = await res.json();
          setLinkPreview(data);
        } else {
          setLinkPreview(null);
        }
      } catch {
        setLinkPreview(null);
      } finally {
        setPreviewLoading(false);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [linkUrl]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("圖片大小不能超過 5MB");
        return;
      }
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!content.trim()) {
      setError("請輸入內容");
      return;
    }
    if (content.trim().length > 2000) {
      setError("內容不能超過 2000 字");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Normalize link URL
      let normalizedUrl = linkUrl.trim();
      if (normalizedUrl && !/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = "https://" + normalizedUrl;
      }

      const response = await fetch("/api/community/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          image_url: imageUrl,
          link_url: linkPreview ? normalizedUrl : null,
          link_title: linkPreview?.title,
          link_description: linkPreview?.description,
          link_image: linkPreview?.image,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "提交失敗");
      }

      // Reset form and close
      setContent("");
      setLinkUrl("");
      setLinkPreview(null);
      setImageFile(null);
      setImageUrl(null);
      setError(null);
      setIsOpen(false);

      // Refresh the page to show new thread
      window.location.reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "提交失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  };

  // Not authenticated - show login prompt
  if (!checkingAuth && !user) {
    return (
      <button
        onClick={() => {
          const supabase = createSupabaseBrowserClient();
          supabase.auth.signInWithPassword({ email: "", password: "" }).then(() => {
            window.location.href = "/admin/login";
          });
        }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-white shadow-lg transition hover:bg-accent-700 hover:shadow-xl md:static md:ml-auto md:h-auto md:w-auto md:rounded-lg md:px-4 md:py-2 md:shadow-none"
      >
        <span className="hidden md:inline">+ 新帖文</span>
        <span className="md:hidden">+</span>
      </button>
    );
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-600 text-white shadow-lg transition hover:bg-accent-700 hover:shadow-xl md:static md:ml-auto md:h-auto md:w-auto md:rounded-lg md:px-4 md:py-2 md:shadow-none"
      >
        <span className="hidden md:inline">+ 新帖文</span>
        <span className="md:hidden">+</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 dark:bg-ink-900 max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-ink-900 dark:text-ink-100">
                新帖文
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Content textarea */}
              <div>
                <textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setError(null);
                  }}
                  placeholder="分享你的想法...（最多 2000 字）"
                  rows={4}
                  maxLength={2000}
                  className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 dark:placeholder:text-ink-500"
                />
                <div className="mt-1 text-right text-xs text-ink-400">
                  {content.length}/2000
                </div>
              </div>

              {/* Image upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {imageUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="max-h-32 rounded-lg border border-ink-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg border border-dashed border-ink-300 px-3 py-2 text-sm text-ink-500 transition hover:border-accent-500 hover:text-accent-600 dark:border-ink-600 dark:text-ink-400"
                  >
                    <ImageIcon className="h-4 w-4" />
                    新增圖片
                  </button>
                )}
              </div>

              {/* Link URL input */}
              <div>
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-ink-400" />
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => {
                      setLinkUrl(e.target.value);
                      if (!e.target.value) setLinkPreview(null);
                    }}
                    placeholder="分享連結（可選）"
                    className="flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-accent-500 focus:outline-none dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
                  />
                  {previewLoading && <Loader2 className="h-4 w-4 animate-spin text-ink-400" />}
                </div>

                {/* Link preview */}
                {linkPreview && linkPreview.title && (
                  <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-start gap-3 rounded-lg border border-ink-200 bg-ink-50 p-3 transition hover:border-ink-300 dark:border-ink-700 dark:bg-ink-800"
                  >
                    {linkPreview.image && (
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-ink-100">
                        <img src={linkPreview.image} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-100">
                        {linkPreview.title}
                      </p>
                      {linkPreview.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-ink-500 dark:text-ink-400">
                          {linkPreview.description}
                        </p>
                      )}
                      <p className="mt-1 flex items-center gap-1 text-xs text-ink-400">
                        <ExternalLink className="h-3 w-3" />
                        {new URL(linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`).hostname.replace("www.", "")}
                      </p>
                    </div>
                  </a>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
                  {error}
                </div>
              )}

              {/* Submit button */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm text-ink-600 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting || checkingAuth || !content.trim()}
                  className="flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-700 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  發布
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}