import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { logger } from "@/lib/logger";

/**
 * Server-side Supabase client (Server Components, Route Handlers, Server Actions).
 * Reads the user's session via cookies.
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  const childLogger = logger.child({ component: "supabase-server" });

  return createServerClient(
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
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // ignored when called from a Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // ignored when called from a Server Component
          }
        },
      },
    }
  );
}
