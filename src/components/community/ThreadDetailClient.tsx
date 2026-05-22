"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { CommentLikeButton } from "@/components/community/CommentLikeButton";
import { BotBadge } from "@/components/community/BotBadge";
import { LikeButton } from "@/components/community/LikeButton";
import { LinkPreview } from "@/components/community/LinkPreview";
import { timeAgo } from "@/lib/utils";
import type { Thread, ThreadComment } from "@/types/database.types";

interface ThreadDetailClientProps {
  threadId: string;
  initialThread?: Thread;
  initialComments?: ThreadComment[];
}

const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop";

export function ThreadDetailClient({ threadId, initialThread, initialComments }: ThreadDetailClientProps) {
  const [thread, setThread] = useState<Thread | null>(initialThread ?? null);
  const [comments, setComments] = useState<ThreadComment[]>(initialComments ?? []);
  const [loading, setLoading] = useState(!initialThread);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [threadLiked, setThreadLiked] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => setCurrentUserId(data.user?.id ?? null))
      .catch(() => setCurrentUserId(null));
  }, []);

  useEffect(() => {
    if (!initialThread) {
      fetch(`/api/community/threads/${threadId}`)
        .then((r) => r.json())
        .then((data) => {
          setThread(data.thread);
          setComments(data.comments ?? []);
        })
        .catch(() => setThread(null))
        .finally(() => setLoading(false));
    }
  }, [threadId, initialThread]);

  const handleThreadLike = useCallback(async () => {
    if (!currentUserId) return;
    // Optimistic update
    const prevLiked = threadLiked;
    setThreadLiked(!prevLiked);
    setThread((prev) => prev ? { ...prev, like_count: prev.like_count + (prevLiked ? -1 : 1) } : null);
    const res = await fetch(`/api/community/threads/${threadId}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setThreadLiked(data.liked);
    } else {
      // Revert on failure
      setThreadLiked(prevLiked);
      setThread((prev) => prev ? { ...prev, like_count: prev.like_count + (prevLiked ? 1 : -1) } : null);
    }
  }, [threadId, currentUserId]);

  const handleCommentLike = useCallback(async (commentId: string) => {
    if (!currentUserId) return;
    const prevLiked = userLikes[commentId] ?? false;
    const prevCount = comments.find((c) => c.id === commentId)?.like_count ?? 0;
    // Optimistic update
    setUserLikes((prev) => ({ ...prev, [commentId]: !prevLiked }));
    setComments((prev) =>
      prev.map((c) => c.id === commentId ? { ...c, like_count: c.like_count + (!prevLiked ? 1 : -1) } : c)
    );
    const res = await fetch(`/api/community/comments/${commentId}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setUserLikes((prev) => ({ ...prev, [commentId]: data.liked }));
    } else {
      // Revert on failure
      setUserLikes((prev) => ({ ...prev, [commentId]: prevLiked }));
      setComments((prev) =>
        prev.map((c) => c.id === commentId ? { ...c, like_count: prevCount } : c)
      );
    }
  }, [currentUserId]);

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/community/threads/${threadId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim(), comment_id: replyingTo }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, data.comment]);
        setCommentText("");
        setReplyingTo(null);
        setThread((prev) => prev ? { ...prev, comment_count: prev.comment_count + 1 } : null);
        setStatusMessage("Comment posted");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to post comment");
        setStatusMessage("Failed to post comment");
      }
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink-400">Thread not found.</p>
        <Link href="/community" className="mt-4 text-accent-500 hover:underline">Back to community</Link>
      </div>
    );
  }

  const authorMeta = thread.author as any;
  const authorName = authorMeta?.raw_user_meta_data?.full_name ?? authorMeta?.email ?? "Anonymous";
  const authorAvatar = authorMeta?.raw_user_meta_data?.avatar_url ?? FALLBACK_AVATAR;

  // Build comment tree
  const topLevel = comments.filter((c) => !c.parent_comment_id);
  const replies = comments.filter((c) => c.parent_comment_id);

  return (
    <div className="max-w-3xl mx-auto">
      {statusMessage && (
        <div aria-live="polite" className="sr-only">
          {statusMessage}
        </div>
      )}
      {/* Back */}
      <Link href="/community" className="mb-6 inline-flex items-center gap-2 text-sm text-ink-400 hover:text-ink-600">
        <ArrowLeft className="h-4 w-4" />
        Back to community
      </Link>

      {/* Thread */}
      <article className="rounded-2xl border border-ink-200/70 bg-white p-6 dark:border-ink-800/70 dark:bg-ink-900">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
            <Image src={authorAvatar} alt={authorName} fill sizes="48px" className="object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{authorName}</span>
              {thread.is_bot_post && <BotBadge />}
            </div>
            <span className="text-sm text-ink-400">{timeAgo(thread.created_at)}</span>
          </div>
        </div>

        <p className="whitespace-pre-wrap text-base leading-relaxed">{DOMPurify.sanitize(thread.content)}</p>

        {thread.image_url && (
          <div className="mt-4 relative aspect-[16/9] w-full overflow-hidden rounded-xl">
            <Image src={thread.image_url} alt="Thread image" fill sizes="800px" className="object-cover" />
          </div>
        )}

        {thread.link_url && (
          <div className="mt-4">
            <LinkPreview url={thread.link_url} title={thread.link_title} description={thread.link_description} image={thread.link_image} />
          </div>
        )}

        <div className="mt-6 flex items-center gap-3 border-t border-ink-100 pt-4 dark:border-ink-800">
          <LikeButton
            count={thread.like_count}
            liked={threadLiked}
            onToggle={handleThreadLike}
            disabled={!currentUserId}
          />
          <div className="flex items-center gap-1.5 text-sm text-ink-500">
            <MessageCircle className="h-4 w-4" />
            <span>{thread.comment_count}</span>
          </div>
        </div>
      </article>

      {/* Comment form */}
      {currentUserId ? (
        <div className="mt-6 rounded-2xl border border-ink-200/70 bg-white p-4 dark:border-ink-800/70 dark:bg-ink-900">
          {replyingTo && (
            <div className="mb-2 text-sm text-ink-400">
              Replying to comment{" "}
              <button onClick={() => setReplyingTo(null)} className="text-accent-500 hover:underline">Cancel</button>
            </div>
          )}
          <textarea
            className="w-full resize-none rounded-xl border border-ink-200 bg-white p-3 text-sm dark:border-ink-800 dark:bg-ink-900 min-h-[80px]"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value.slice(0, 1000))}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handlePostComment}
              disabled={!commentText.trim() || posting}
              className="rounded-full bg-accent-500 px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50"
            >
              {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Comment"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-ink-200/70 bg-white p-4 text-center dark:border-ink-800/70 dark:bg-ink-900">
          <p className="text-sm text-ink-400">
            <Link href={`/login?next=${encodeURIComponent(currentPath)}`} className="text-accent-500 hover:underline">Login</Link> to comment
          </p>
        </div>
      )}

      {/* Comments */}
      <div className="mt-8 space-y-4">
        {topLevel.map((comment) => {
          const commentReplies = replies.filter((r) => r.parent_comment_id === comment.id);
          const authorCM = comment.author as any;
          return (
            <div key={comment.id} className="space-y-3">
              <div className="rounded-2xl border border-ink-200/70 bg-white p-4 dark:border-ink-800/70 dark:bg-ink-900">
                <div className="mb-2 flex items-center gap-2">
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={authorCM?.raw_user_meta_data?.avatar_url ?? FALLBACK_AVATAR}
                      alt={authorCM?.email ?? "User"}
                      fill sizes="32px"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm font-semibold">{authorCM?.email ?? "Anonymous"}</span>
                  {comment.is_bot_comment && <BotBadge />}
                  <span className="text-xs text-ink-400">{timeAgo(comment.created_at)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm">{DOMPurify.sanitize(comment.content)}</p>
                <div className="mt-3 flex items-center gap-3">
                  <CommentLikeButton
                    count={comment.like_count}
                    liked={userLikes[comment.id] ?? false}
                    onToggle={() => handleCommentLike(comment.id)}
                    disabled={!currentUserId}
                  />
                  {currentUserId && (
                    <button
                      type="button"
                      onClick={() => setReplyingTo(comment.id)}
                      className="text-xs text-ink-400 hover:text-ink-600"
                    >
                      Reply
                    </button>
                  )}
                </div>
              </div>

              {/* Nested replies */}
              {commentReplies.map((reply) => {
                const replyAuthor = reply.author as any;
                return (
                  <div key={reply.id} className="ml-8 rounded-2xl border border-ink-200/70 bg-ink-50 p-4 dark:border-ink-800/70 dark:bg-ink-800/50">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full">
                        <Image
                          src={replyAuthor?.raw_user_meta_data?.avatar_url ?? FALLBACK_AVATAR}
                          alt={replyAuthor?.email ?? "User"}
                          fill sizes="28px"
                          className="object-cover"
                        />
                      </div>
                      <span className="text-xs font-semibold">{replyAuthor?.email ?? "Anonymous"}</span>
                      {reply.is_bot_comment && <BotBadge />}
                      <span className="text-xs text-ink-400">{timeAgo(reply.created_at)}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{DOMPurify.sanitize(reply.content)}</p>
                    <div className="mt-2">
                      <CommentLikeButton
                        count={reply.like_count}
                        liked={userLikes[reply.id] ?? false}
                        onToggle={() => handleCommentLike(reply.id)}
                        disabled={!currentUserId}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {!loading && comments.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-400">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}