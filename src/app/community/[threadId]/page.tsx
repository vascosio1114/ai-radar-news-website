"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Heart, MessageCircle, Share2, Loader2 } from "lucide-react";
import { BotBadge } from "@/components/shared/BotBadge";
import { LinkPreview } from "@/components/community/LinkPreview";
import { CommentBlock, Comment } from "@/components/community/CommentBlock";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Thread {
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

export default function ThreadDetailPage() {
  const params = useParams();
  const threadId = params.threadId as string;

  const [thread, setThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createSupabaseBrowserClient();

  const checkAuth = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  }, [supabase]);

  const fetchThread = useCallback(async () => {
    const { data, error } = await supabase
      .from("threads")
      .select("*, profile:profiles(display_name, avatar_url)")
      .eq("id", threadId)
      .single();

    if (error) {
      setError("Failed to load thread");
      setIsLoading(false);
      return;
    }

    setThread(data);
    setLikeCount(data.like_count);
    setIsLoading(false);
  }, [supabase, threadId]);

  const fetchComments = useCallback(async () => {
    // First fetch all comments for this thread
    const { data: allComments, error } = await supabase
      .from("thread_comments")
      .select("*, profile:profiles(display_name, avatar_url)")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return;
    }

    // Separate top-level comments and replies
    const topLevelComments: Comment[] = [];
    const repliesMap: Record<string, Comment[]> = {};

    allComments.forEach((comment) => {
      if (comment.parent_comment_id) {
        // This is a reply
        if (!repliesMap[comment.parent_comment_id]) {
          repliesMap[comment.parent_comment_id] = [];
        }
        repliesMap[comment.parent_comment_id].push(comment);
      } else {
        // This is a top-level comment
        topLevelComments.push(comment);
      }
    });

    // Attach replies to their parent comments
    topLevelComments.forEach((comment) => {
      if (repliesMap[comment.id]) {
        comment.replies = repliesMap[comment.id];
      }
    });

    setComments(topLevelComments);
  }, [supabase, threadId]);

  const fetchLikeStatus = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("thread_likes")
      .select("thread_id")
      .eq("thread_id", threadId)
      .eq("user_id", user.id)
      .single();

    setIsLiked(!!data);
  }, [supabase, threadId]);

  useEffect(() => {
    checkAuth();
    fetchThread();
    fetchComments();
    fetchLikeStatus();
  }, [checkAuth, fetchThread, fetchComments, fetchLikeStatus]);

  const handleLike = async () => {
    if (!isAuthenticated || isLiking) return;

    setIsLiking(true);
    const newLiked = !isLiked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    setIsLiked(newLiked);
    setLikeCount(newCount);

    try {
      const response = await fetch(`/api/community/threads/${threadId}/like`, {
        method: "POST",
      });

      if (!response.ok) {
        setIsLiked(!newLiked);
        setLikeCount(newLiked ? newCount - 1 : newCount + 1);
      }
    } catch {
      setIsLiked(!newLiked);
      setLikeCount(newLiked ? newCount - 1 : newCount + 1);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/community/${threadId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleNewComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/community/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_id: threadId,
          content: newCommentContent.trim(),
        }),
      });

      if (response.ok) {
        setNewCommentContent("");
        fetchComments();
        if (thread) {
          setThread({ ...thread, comment_count: thread.comment_count + 1 });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyAdded = () => {
    fetchComments();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-ink-400" />
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-xl border border-ink-200 bg-white p-8 text-center dark:border-ink-700 dark:bg-ink-900">
          <p className="text-ink-500">{error || "Thread not found"}</p>
          <Link
            href="/community"
            className="mt-4 inline-block text-accent-600 hover:underline"
          >
            返回社群
          </Link>
        </div>
      </div>
    );
  }

  const authorName = thread.profile?.display_name || "匿名用戶";
  const authorAvatar = thread.profile?.avatar_url || "";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href="/community"
        className="mb-6 inline-flex items-center gap-2 text-sm text-ink-500 transition hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回社群
      </Link>

      {/* Thread content */}
      <div className="mb-8 rounded-xl border border-ink-200 bg-white p-6 dark:border-ink-700 dark:bg-ink-900">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-100">
            {authorAvatar ? (
              <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-ink-400">{authorName[0]}</span>
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
              <span className="text-sm text-ink-400">· {formatRelativeTime(thread.created_at)}</span>
            </div>

            {/* Content */}
            <p className="mt-3 whitespace-pre-wrap text-ink-700 dark:text-ink-300">
              {thread.content}
            </p>

            {/* Image */}
            {thread.image_url && (
              <div className="mt-4 overflow-hidden rounded-lg">
                <img
                  src={thread.image_url}
                  alt=""
                  className="max-h-96 w-auto object-cover"
                />
              </div>
            )}

            {/* Link preview */}
            {thread.link_url && thread.link_title && (
              <div className="mt-4">
                <LinkPreview
                  url={thread.link_url}
                  title={thread.link_title}
                  description={thread.link_description || undefined}
                  image={thread.link_image || undefined}
                />
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex items-center gap-4 border-t border-ink-100 pt-4 dark:border-ink-800">
              <button
                onClick={handleLike}
                disabled={!isAuthenticated || isLiking}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  isLiked
                    ? "bg-rose-50 text-rose-500 dark:bg-rose-900/20"
                    : isAuthenticated
                    ? "text-ink-500 hover:bg-ink-50 dark:text-ink-400 dark:hover:bg-ink-800"
                    : "cursor-not-allowed opacity-50"
                }`}
              >
                {isLiking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                )}
                <span>{likeCount}</span>
              </button>

              <div className="flex items-center gap-2 text-sm text-ink-500">
                <MessageCircle className="h-4 w-4" />
                <span>{thread.comment_count} 留言</span>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-500 transition hover:bg-ink-50 dark:text-ink-400 dark:hover:bg-ink-800"
              >
                <Share2 className="h-4 w-4" />
                <span>{copied ? "已複製!" : "分享"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments section */}
      <div id="comments" className="rounded-xl border border-ink-200 bg-white p-6 dark:border-ink-700 dark:bg-ink-900">
        <h2 className="mb-6 font-display text-xl font-bold text-ink-900 dark:text-ink-100">
          留言 {thread.comment_count}
        </h2>

        {/* New comment form */}
        {isAuthenticated ? (
          <form onSubmit={handleNewComment} className="mb-8">
            <textarea
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              placeholder="添加留言...（最多1000字）"
              maxLength={1000}
              rows={3}
              className="w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm focus:border-accent-500 focus:outline-none dark:border-ink-700 dark:bg-ink-900"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={!newCommentContent.trim() || isSubmitting}
                className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-700 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "發布留言"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-8 rounded-lg border border-ink-200 bg-ink-50 p-4 text-center dark:border-ink-700 dark:bg-ink-800">
            <p className="text-ink-500">登入後可留言</p>
          </div>
        )}

        {/* Comments list */}
        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentBlock
                key={comment.id}
                comment={comment}
                threadAuthorId={thread.author_id}
                isAuthenticated={isAuthenticated}
                onReplyAdded={handleReplyAdded}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-ink-400">尚無留言</div>
        )}
      </div>
    </div>
  );
}