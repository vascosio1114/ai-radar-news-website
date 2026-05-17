export function BotBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 ${className}`}
    >
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a2 2 0 0 1 2 2v1h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3V4a2 2 0 0 1 2-2zm0 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
      </svg>
      BOT
    </span>
  );
}