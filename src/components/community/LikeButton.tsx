"use client";

import { useState, useCallback } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  count: number;
  liked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function LikeButton({ count, liked, onToggle, disabled }: LikeButtonProps) {
  const [optimisticLiked, setOptimisticLiked] = useState(liked);
  const [optimisticCount, setOptimisticCount] = useState(count);

  const handleClick = useCallback(() => {
    const newLiked = !optimisticLiked;
    setOptimisticLiked(newLiked);
    setOptimisticCount((prev) => (newLiked ? prev + 1 : prev - 1));
    onToggle();
  }, [onToggle, optimisticLiked]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
        "border border-ink-200 dark:border-ink-800",
        "hover:border-pink-300 hover:bg-pink-50 dark:hover:border-pink-700 dark:hover:bg-pink-900/30",
        optimisticLiked
          ? "border-pink-300 bg-pink-50 text-pink-600 dark:border-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
          : "text-ink-500 dark:text-ink-400",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Heart
        className={cn("h-4 w-4 transition-transform", optimisticLiked && "fill-current scale-110")}
      />
      <span>{optimisticCount}</span>
    </button>
  );
}