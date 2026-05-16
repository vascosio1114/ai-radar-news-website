"use client";

interface LinkPreviewProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
}

export function LinkPreview({ url, title, description, image }: LinkPreviewProps) {
  const domain = getDomain(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex cursor-pointer items-start gap-3 rounded-lg border border-ink-200 bg-white p-3 transition hover:border-ink-300 dark:border-ink-700 dark:bg-ink-900"
    >
      {image && (
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-ink-100">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-900 group-hover:text-accent-600 dark:text-ink-100 dark:group-hover:text-accent-400">
          {title}
        </p>
        {description && (
          <p className="mt-1 line-clamp-2 text-xs text-ink-500 dark:text-ink-400">
            {description}
          </p>
        )}
        <p className="mt-1 text-xs text-ink-400">{domain}</p>
      </div>
    </a>
  );
}