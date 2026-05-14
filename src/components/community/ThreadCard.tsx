"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { BotBadge } from "@/components/shared/BotBadge";
import { LinkPreview } from "./LinkPreview";

/** Thread row from database - also used for mock data in CommunityFeed */
export interface Thread {
  id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  link_url: string | null;
  link_title: string | null;
  link_description: string | null;
  link_image: string | null;
  is_bot_post: boolean;
  like_count: number;
  comment_count: number;
  created_at: string;
  /** Optional profile join for display name / avatar */
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "剛剛";
  if (diffMins < 60) return `${diffMins}分鐘前`;
  if (diffHours < 24) return `${diffHours}小時前`;
  if (diffDays < 30) return `${diffDays}天前`;
  return date.toLocaleDateString("zh-HK", { month: "short", day: "numeric" });
}

interface ThreadCardProps {
  thread: Thread;
}

export function ThreadCard({ thread }: ThreadCardProps) {
  const [copied, setCopied] = useState(false);

  const authorName = thread.profile?.display_name || "匿名用戶";
  const authorAvatar = thread.profile?.avatar_url || "";

  const truncatedContent =
    thread.content.length > 150
      ? thread.content.slice(0, 150) + "..."
      : thread.content;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/community/${thread.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  };

  return (
    <div className="flex gap-3 rounded-xl border border-ink-200 bg-white p-4 transition hover:shadow-md dark:border-ink-700 dark:bg-ink-900">
      {/* Avatar */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-100">
        {authorAvatar ? (
          <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
        ) : (
          <span className="text-lg font-bold text-ink-400">{authorName[0]}</span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Author info */}
        <div className="flex items-center gap-2">
          <Link
            href={`/profile/${thread.author_id}`}
            className="font-semibold text-ink-900 hover:text-accent-600 dark:text-ink-100 dark:hover:text-accent-400"
          >
            {authorName}
          </Link>
          {thread.is_bot_post && <BotBadge />}
          <span className="text-xs text-ink-400">· {formatRelativeTime(thread.created_at)}</span>
        </div>

        {/* Content preview */}
        <Link href={`/community/${thread.id}`}>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700 dark:text-ink-300">
            {truncatedContent}
          </p>
        </Link>

        {/* Image thumbnail */}
        {thread.image_url && (
          <div className="mt-3 overflow-hidden rounded-lg">
            <img
              src={thread.image_url}
              alt=""
              className="max-h-64 w-auto object-cover"
            />
          </div>
        )}

        {/* Link preview */}
        {thread.link_url && thread.link_title && (
          <div className="mt-3">
            <LinkPreview
              url={thread.link_url}
              title={thread.link_title}
              description={thread.link_description || undefined}
              image={thread.link_image || undefined}
            />
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-4">
          {/* Like button */}
          <button className="flex items-center gap-1 text-sm text-ink-500 transition hover:text-rose-500 dark:text-ink-400">
            <Heart className="h-4 w-4" />
            <span>{thread.like_count}</span>
          </button>

          {/* Comment count */}
          <Link
            href={`/community/${thread.id}#comments`}
            className="flex items-center gap-1 text-sm text-ink-500 transition hover:text-accent-600 dark:text-ink-400 dark:hover:text-accent-400"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{thread.comment_count}</span>
          </Link>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-sm text-ink-500 transition hover:text-accent-600 dark:text-ink-400 dark:hover:text-accent-400"
          >
            <Share2 className="h-4 w-4" />
            <span>{copied ? "已複製!" : "分享"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}