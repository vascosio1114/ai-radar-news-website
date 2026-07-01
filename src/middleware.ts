import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { logger } from "@/lib/logger";

const log = logger.child({ component: "middleware" });

const SUPPORTED_LANGS = ["zh", "en"];
const DEFAULT_LANG = "zh";

function createAdminAuthClient(request: NextRequest) {
  const cookieStore = {
    get(name: string) {
      return request.cookies.get(name);
    },
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      logger: {
        log: {
          error: log.error.bind(log),
          warn: log.warn.bind(log),
          info: log.info.bind(log),
        },
      },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Read-only for middleware - we can't set cookies here
        },
        remove(name: string, options: CookieOptions) {
          // Read-only for middleware
        },
      },
    }
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const start = Date.now();

  // Skip if it's a file with an extension (e.g. .svg, .png, .ico)
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  // Admin login/setup are public and should not be locale-prefixed.
  if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/setup")) {
    return NextResponse.next();
  }

  // Admin routes — require admin authentication.
  if (pathname.startsWith("/admin")) {
    const supabase = createAdminAuthClient(request);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      log.warn({ pathname, reason: "no_session" }, "Admin access denied - no session");
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Note: is_admin is checked in the admin layout server-side via profiles.is_admin.
    // We still require a valid session here to block completely anonymous users.

    const response = NextResponse.next();
    log.info({
      method: request.method,
      pathname,
      userId: user.id,
      status: response.status,
      duration: Date.now() - start,
    });
    return response;
  }

  // Check if pathname has a supported language prefix
  const pathnameHasLocale = SUPPORTED_LANGS.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    const response = NextResponse.next();
    log.info({
      method: request.method,
      pathname,
      status: response.status,
      duration: Date.now() - start,
    });
    return response;
  }

  // Redirect to default locale
  const response = NextResponse.redirect(
    new URL(`/${DEFAULT_LANG}${pathname === "/" ? "" : pathname}`, request.url)
  );
  log.info({
    method: request.method,
    pathname,
    status: response.status,
    redirectedTo: response.headers.get("location"),
    duration: Date.now() - start,
  });
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.svg (favicon files)
     * - robots.txt, sitemap.xml (SEO files)
     * - admin (admin dashboard)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|robots.txt|sitemap.xml).*)",
  ],
};
