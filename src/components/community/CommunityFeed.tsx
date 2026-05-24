"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, X } from "lucide-react";
import { CommunitySidebar } from "@/components/community/CommunitySidebar";
import { ThreadCard } from "@/components/community/ThreadCard";
import { NewThreadModal } from "@/components/community/NewThreadModal";
import type { Thread } from "@/types/database.types";

interface CommunityFeedProps {
  initialThreads?: Thread[];
  lang?: "zh" | "en";
  sidebarData?: {
    tags: string[];
    members: Array<{ name: string; avatar: string }>;
  };
}

export function CommunityFeed({
  initialThreads = [],
  lang = "en",
  sidebarData,
}: CommunityFeedProps) {
  const [threads, setThreads] = useState<Thread[]>(initialThreads);
  const [loading, setLoading] = useState(!initialThreads.length);
  const [hasMore, setHasMore] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const observerRef = useRef<HTMLDivElement>(null);

  // Fetch current user
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => setCurrentUserId(data.user?.id ?? null))
      .catch(() => setCurrentUserId(null));
  }, []);

  // Fetch threads
  const fetchThreads = useCallback(async (offset = 0) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/community?limit=20&offset=${offset}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Request failed");
      }
      const data = await res.json();
      setThreads((prev) => (offset === 0 ? data.threads : [...prev, ...data.threads]));
      setHasMore(data.threads?.length === 20);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialThreads.length) {
      fetchThreads(0);
    }
  }, [fetchThreads, initialThreads.length]);

  // Infinite scroll via IntersectionObserver
  const threadsCountRef = useRef(0);
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchThreads(threadsCountRef.current);
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchThreads]);

  // Track thread count for pagination
  useEffect(() => {
    threadsCountRef.current = threads.length;
  }, [threads.length]);

  // Like toggle
  const handleLike = useCallback(
    async (threadId: string) => {
      if (!currentUserId) return;
      const res = await fetch(`/api/community/threads/${threadId}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUserLikes((prev) => ({ ...prev, [threadId]: data.liked }));
      }
    },
    [currentUserId]
  );

  // New thread added
  const handleNewThread = useCallback((thread: Thread) => {
    setThreads((prev) => [thread, ...prev]);
    setShowNewModal(false);
    setStatusMessage(lang === "zh" ? "討論已成功發布" : "Thread posted successfully");
  }, [lang]);

  return (
    <>
      {statusMessage && (
        <div aria-live="polite" className="sr-only">
          {statusMessage}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              liked={userLikes[thread.id] ?? false}
              onLike={() => handleLike(thread.id)}
              currentUserId={currentUserId}
              lang={lang}
            />
          ))}

          {/* Load more trigger */}
          <div ref={observerRef} className="h-4" />

          {loading && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
            </div>
          )}

          {!loading && threads.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-ink-400">{lang === "zh" ? "目前尚未有討論，歡迎發布第一則內容。" : "No threads yet. Be the first to post."}</p>
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <CommunitySidebar
            lang={lang}
            tags={sidebarData?.tags}
            members={sidebarData?.members}
          />
        </div>
      </div>

      {/* Floating New Thread button */}
      <button
        type="button"
        onClick={() => setShowNewModal(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent-500 text-white shadow-lg transition hover:bg-accent-600 hover:scale-105 md:top-24 md:bottom-auto"
        aria-label="New thread"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* New Thread Modal */}
      {showNewModal && (
        <NewThreadModal
          lang={lang}
          onClose={() => setShowNewModal(false)}
          onSuccess={handleNewThread}
        />
      )}
    </>
  );
}