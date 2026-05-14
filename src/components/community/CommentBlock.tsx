"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Loader2 } from "lucide-react";
import { BotBadge } from "@/components/shared/BotBadge";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export interface Comment {
  id: string;
  thread_id: string;
  parent_comment_id: string | null;
  author_id: string;
  content: string;
  is_bot_comment: boolean;
  like_count: number;
  created_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  replies?: Comment[];
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

interface CommentBlockProps {
  comment: Comment;
  threadAuthorId: string;
  isAuthenticated: boolean;
  onReplyAdded?: () => void;
}

export function CommentBlock({
  comment,
  threadAuthorId,
  isAuthenticated,
  onReplyAdded,
}: CommentBlockProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const authorName = comment.profile?.display_name || "匿名用戶";
  const authorAvatar = comment.profile?.avatar_url || "";
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleLike = async () => {
    if (!isAuthenticated || isLiking) return;

    setIsLiking(true);
    // Optimistic update
    const newLiked = !isLiked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    setIsLiked(newLiked);
    setLikeCount(newCount);

    try {
      const supabase = createSupabaseBrowserClient();
      const response = await fetch(`/api/community/comments/${comment.id}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        // Revert on error
        setIsLiked(!newLiked);
        setLikeCount(newLiked ? newCount - 1 : newCount + 1);
      }
    } catch {
      // Revert on error
      setIsLiked(!newLiked);
      setLikeCount(newLiked ? newCount - 1 : newCount + 1);
    } finally {
      setIsLiking(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const response = await fetch("/api/community/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_id: comment.thread_id,
          parent_comment_id: comment.id,
          content: replyContent.trim(),
        }),
      });

      if (response.ok) {
        setReplyContent("");
        setShowReplyForm(false);
        onReplyAdded?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelReply = () => {
    setReplyContent("");
    setShowReplyForm(false);
  };

  return (
    <div className="group">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-100">
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-ink-400">{authorName[0]}</span>
          )}
        </div>

        {/* Comment content */}
        <div className="min-w-0 flex-1">
          {/* Author info */}
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${comment.author_id}`}
              className="text-sm font-semibold text-ink-900 hover:text-accent-600 dark:text-ink-100 dark:hover:text-accent-400"
            >
              {authorName}
            </Link>
            {comment.is_bot_comment && <BotBadge />}
            <span className="text-xs text-ink-400">· {formatRelativeTime(comment.created_at)}</span>
          </div>

          {/* Content */}
          <p className="mt-1 whitespace-pre-wrap text-sm text-ink-700 dark:text-ink-300">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="mt-2 flex items-center gap-3">
            {/* Like button */}
            <button
              onClick={handleLike}
              disabled={!isAuthenticated || isLiking}
              className={`flex items-center gap-1 text-xs transition ${
                isLiked
                  ? "text-rose-500"
                  : isAuthenticated
                  ? "text-ink-400 hover:text-rose-500"
                  : "text-ink-400 cursor-not-allowed opacity-50"
              }`}
            >
              {isLiking ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Heart className={`h-3 w-3 ${isLiked ? "fill-current" : ""}`} />
              )}
              <span>{likeCount}</span>
            </button>

            {/* Reply button - only show for top-level comments */}
            {!comment.parent_comment_id && isAuthenticated && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-xs text-ink-400 transition hover:text-accent-600 dark:text-ink-400 dark:hover:text-accent-400"
              >
                <MessageCircle className="h-3 w-3" />
                <span>回覆</span>
              </button>
            )}
          </div>

          {/* Reply form - inline below comment */}
          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="mt-3 flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="輸入回覆..."
                maxLength={1000}
                className="flex-1 rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-accent-500 focus:outline-none dark:border-ink-700 dark:bg-ink-900"
              />
              <button
                type="submit"
                disabled={!replyContent.trim() || isSubmitting}
                className="rounded-lg bg-accent-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-accent-700 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "發送"}
              </button>
              <button
                type="button"
                onClick={handleCancelReply}
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-50 dark:border-ink-700 dark:text-ink-400 dark:hover:bg-ink-800"
              >
                取消
              </button>
            </form>
          )}

          {/* Nested replies section */}
          {hasReplies && (
            <div className="mt-3">
              {/* Toggle replies visibility */}
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs text-ink-400 transition hover:text-accent-600 dark:text-ink-400 dark:hover:text-accent-400"
              >
                {showReplies ? "隱藏" : "顯示"} {comment.replies!.length} 條回覆
              </button>

              {/* Replies - indented */}
              {showReplies && (
                <div className="mt-3 space-y-3 border-l-2 border-ink-100 pl-4 dark:border-ink-800">
                  {comment.replies!.map((reply) => (
                    <CommentBlock
                      key={reply.id}
                      comment={reply}
                      threadAuthorId={threadAuthorId}
                      isAuthenticated={isAuthenticated}
                      onReplyAdded={onReplyAdded}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}