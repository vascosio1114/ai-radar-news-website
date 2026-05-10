import { User } from "lucide-react";
import Image from "next/image";

interface AuthorCardProps {
  name: string;
  bio?: string;
  avatar?: string;
}

/**
 * Article footer author card.
 * Shows author avatar, name, and optional bio.
 */
export default function AuthorCard({ name, bio, avatar }: AuthorCardProps) {
  return (
    <div className="mt-12 rounded-2xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-900">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-100 text-accent-600 dark:bg-accent-900 dark:text-accent-300">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={48}
              height={48}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <User className="h-5 w-5" />
          )}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink-500 dark:text-ink-400">
            作者
          </p>
          <h4 className="mt-1 font-display text-lg font-semibold">{name}</h4>
          {bio && (
            <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}