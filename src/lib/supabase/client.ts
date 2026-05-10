"use client";

import { createBrowserClient } from "@supabase/ssr";
import { logger } from "@/lib/logger";

/**
 * Browser-side Supabase client.
 * Use this inside Client Components / event handlers.
 */
export function createSupabaseBrowserClient() {
  const childLogger = logger.child({ component: "supabase-browser" });

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      logger: {
        log: {
          error: childLogger.error.bind(childLogger),
          warn: childLogger.warn.bind(childLogger),
          info: childLogger.info.bind(childLogger),
        },
      },
    }
  );
}
