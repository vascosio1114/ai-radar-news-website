"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Share2, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { BotBadge } from "@/components/shared/BotBadge";
import { LinkPreview } from "./LinkPreview";

export interface Thread {
  id: string;
  authorAvatar: string;
  authorName: string;
  authorId: string;
  timestamp: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImage?: string;
  isBotPost: boolean;
  likeCount: number;
  commentCount: number;
}

interface ThreadCardProps {
  thread: Thread;
}

export function ThreadCard({ thread }: ThreadCardProps) {
  const [copied, setCopied] = useState(false);

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
        {thread.authorAvatar ? (
          <img src={thread.authorAvatar} alt={thread.authorName} className="h-full w-full object-cover" />
        ) : (
          <span className="text-lg font-bold text-ink-400">{thread.authorName[0]}</span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Author info */}
        <div className="flex items-center gap-2">
          <Link
            href={`/profile/${thread.authorId}`}
            className="font-semibold text-ink-900 hover:text-accent-600 dark:text-ink-100 dark:hover:text-accent-400"
          >
            {thread.authorName}
          </Link>
          {thread.isBotPost && <BotBadge />}
          <span className="text-xs text-ink-400">· {thread.timestamp}</span>
        </div>

        {/* Content preview */}
        <Link href={`/community/${thread.id}`}>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink-700 dark:text-ink-300">
            {truncatedContent}
          </p>
        </Link>

        {/* Image thumbnail */}
        {thread.imageUrl && (
          <div className="mt-3 overflow-hidden rounded-lg">
            <img
              src={thread.imageUrl}
              alt=""
              className="max-h-64 w-auto object-cover"
            />
          </div>
        )}

        {/* Link preview */}
        {thread.linkUrl && thread.linkTitle && (
          <div className="mt-3">
            <LinkPreview
              url={thread.linkUrl}
              title={thread.linkTitle}
              description={thread.linkDescription}
              image={thread.linkImage}
            />
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-4">
          {/* Like button */}
          <button className="flex items-center gap-1 text-sm text-ink-500 transition hover:text-rose-500 dark:text-ink-400">
            <Heart className="h-4 w-4" />
            <span>{thread.likeCount}</span>
          </button>

          {/* Comment count */}
          <Link
            href={`/community/${thread.id}#comments`}
            className="flex items-center gap-1 text-sm text-ink-500 transition hover:text-accent-600 dark:text-ink-400 dark:hover:text-accent-400"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{thread.commentCount}</span>
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