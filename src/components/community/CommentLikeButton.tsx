"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommentLikeButtonProps {
  count: number;
  liked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function CommentLikeButton({ count, liked, onToggle, disabled }: CommentLikeButtonProps) {
  const [optimisticLiked, setOptimisticLiked] = useState(liked);
  const [optimisticCount, setOptimisticCount] = useState(count);

  return (
    <button
      type="button"
      onClick={() => {
        const newLiked = !optimisticLiked;
        setOptimisticLiked(newLiked);
        setOptimisticCount((prev) => (newLiked ? prev + 1 : prev - 1));
        onToggle();
      }}
      disabled={disabled}
      className={cn(
        "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-all",
        optimisticLiked
          ? "text-pink-500"
          : "text-ink-400 hover:text-pink-500",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Heart className={cn("h-3.5 w-3.5", optimisticLiked && "fill-current")} />
      <span>{optimisticCount}</span>
    </button>
  );
}