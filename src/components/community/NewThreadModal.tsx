"use client";

import { useState, useRef, useEffect } from "react";
import { X, ImageIcon, Link2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoginPrompt } from "@/components/community/LoginPrompt";

interface NewThreadModalProps {
  onClose: () => void;
  onSuccess: (thread: any) => void;
  isOpen?: boolean;
}

export function NewThreadModal({ onClose, onSuccess, isOpen = true }: NewThreadModalProps) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [linkMeta, setLinkMeta] = useState<{ title?: string; description?: string; image?: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus trap and Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => setIsAuthenticated(!!data.user))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const MAX_CHARS = 2000;

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/community/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setImageUrl(data.url);
    } finally {
      setUploading(false);
    }
  };

  const handleLinkFetch = async (url: string) => {
    setLinkUrl(url);
    try {
      const res = await fetch(`/api/community/link-preview?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setLinkMeta(data);
    } catch {
      setLinkMeta(null);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          image_url: imageUrl,
          link_url: linkUrl,
          link_title: linkMeta?.title,
          link_description: linkMeta?.description,
          link_image: linkMeta?.image,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to post");
        return;
      }
      onSuccess(data.thread);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-ink-200 bg-white p-6 shadow-xl dark:border-ink-800 dark:bg-ink-900">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">New Thread</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-ink-100 dark:hover:bg-ink-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isAuthenticated === false ? (
          <LoginPrompt message="Login to post a thread" />
        ) : isAuthenticated === null ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-ink-400" />
          </div>
        ) : (
          <>
            {/* Content textarea */}
            <textarea
              ref={textareaRef}
              className="mb-4 w-full resize-none rounded-xl border border-ink-200 bg-white p-4 text-sm dark:border-ink-800 dark:bg-ink-900 min-h-[120px]"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
            />
        <div className="mb-4 text-right text-xs text-ink-400">{content.length}/{MAX_CHARS}</div>

        {/* Attachments */}
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-sm text-ink-500 transition hover:bg-ink-100 dark:border-ink-800 dark:hover:bg-ink-800"
          >
            <ImageIcon className="h-4 w-4" />
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Photo"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }} />

          <button
            type="button"
            onClick={() => linkInputRef.current?.focus()}
            className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-sm text-ink-500 transition hover:bg-ink-100 dark:border-ink-800 dark:hover:bg-ink-800"
          >
            <Link2 className="h-4 w-4" />
            Link
          </button>
        </div>

        {/* Image preview */}
        {imageUrl && (
          <div className="mb-4 relative aspect-[16/9] w-full overflow-hidden rounded-xl">
            <img src={imageUrl} alt="Upload preview" className="object-cover w-full h-full" />
            <button
              type="button"
              onClick={() => setImageUrl(null)}
              className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Link input */}
        <div className="mb-4">
          <input
            ref={linkInputRef}
            type="url"
            placeholder="Paste a link URL..."
            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm dark:border-ink-800 dark:bg-ink-900"
            onBlur={(e) => {
              if (e.target.value) handleLinkFetch(e.target.value);
            }}
          />
        </div>

        {/* Link preview */}
        {linkMeta && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-ink-200 p-3 dark:border-ink-800">
            {linkMeta.image && (
              <img src={linkMeta.image} alt="" className="h-16 w-24 rounded-lg object-cover shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold">{linkMeta.title}</p>
              <p className="text-xs text-ink-400 line-clamp-2">{linkMeta.description}</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ink-200 px-5 py-2 text-sm font-medium text-ink-500 transition hover:bg-ink-100 dark:border-ink-800 dark:hover:bg-ink-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePost}
            disabled={!content.trim() || posting}
            className={cn(
              "rounded-full bg-accent-500 px-5 py-2 text-sm font-medium text-white transition",
              (!content.trim() || posting) && "opacity-50 cursor-not-allowed"
            )}
          >
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
          </button>
        </div>
          </>
        )}
      </div>
    </div>
  );
}