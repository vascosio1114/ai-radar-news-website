import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

const log = logger.child({ component: "middleware" });

const SUPPORTED_LANGS = ["zh", "en"];
const DEFAULT_LANG = "zh";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const start = Date.now();

  // Skip if it's a file with an extension (e.g. .svg, .png, .ico)
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  // Admin routes — leave untouched
  if (pathname.startsWith("/admin")) {
    const response = NextResponse.next();
    log.info({
      method: request.method,
      pathname,
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
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|robots.txt|sitemap.xml|admin).*)",
  ],
};