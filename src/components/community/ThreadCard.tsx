import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Share2, ExternalLink } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { LikeButton } from "@/components/community/LikeButton";
import { BotBadge } from "@/components/community/BotBadge";
import { timeAgo } from "@/lib/utils";
import type { Thread } from "@/types/database.types";

interface ThreadCardProps {
  thread: Thread;
  liked?: boolean;
  onLike?: () => void;
  currentUserId?: string | null;
}

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop";

export function ThreadCard({ thread, liked = false, onLike, currentUserId }: ThreadCardProps) {
  const authorMeta = thread.author as any;
  const authorName = authorMeta?.raw_user_meta_data?.full_name ?? authorMeta?.email ?? "Anonymous";
  const authorAvatar = authorMeta?.raw_user_meta_data?.avatar_url ?? FALLBACK_AVATAR;

  return (
    <article className="rounded-2xl border border-ink-200/70 bg-white p-5 dark:border-ink-800/70 dark:bg-ink-900">
      {/* Author row */}
      <div className="mb-3 flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
          <Image
            src={authorAvatar}
            alt={authorName}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">{authorName}</span>
            {thread.is_bot_post && <BotBadge />}
          </div>
          <span className="text-xs text-ink-400">{timeAgo(thread.created_at)}</span>
        </div>
      </div>

      {/* Content */}
      <Link href={`/community/${thread.id}`} className="block">
        <p className="mb-3 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed">
          {DOMPurify.sanitize(thread.content.length > 150 ? thread.content.slice(0, 150) + "…" : thread.content)}
        </p>
      </Link>

      {/* Image */}
      {thread.image_url && (
        <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-xl">
          <Image
            src={thread.image_url}
            alt="Thread image"
            fill
            sizes="(min-width: 640px) 600px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      {/* Link preview */}
      {thread.link_url && (
        <a
          href={thread.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 flex items-start gap-3 rounded-xl border border-ink-200 p-3 transition hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800/50"
        >
          {thread.link_image && (
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg">
              <Image
                src={thread.link_image}
                alt={thread.link_title ?? "Link"}
                fill
                sizes="96px"
                className="object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 text-xs text-ink-400">
              <ExternalLink className="h-3 w-3" />
              <span className="truncate">{thread.link_url}</span>
            </div>
            {thread.link_title && (
              <p className="mt-1 line-clamp-1 text-sm font-semibold">{thread.link_title}</p>
            )}
            {thread.link_description && (
              <p className="mt-0.5 line-clamp-2 text-xs text-ink-500 dark:text-ink-400">
                {thread.link_description}
              </p>
            )}
          </div>
        </a>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-3">
        <LikeButton
          count={thread.like_count}
          liked={liked}
          onToggle={onLike ?? (() => {})}
          disabled={!currentUserId}
        />

        <Link
          href={`/community/${thread.id}`}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink-500 transition hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{thread.comment_count}</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            if (typeof navigator !== "undefined") {
              navigator.clipboard.writeText(`${window.location.origin}/community/${thread.id}`);
            }
          }}
          className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink-500 transition hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}