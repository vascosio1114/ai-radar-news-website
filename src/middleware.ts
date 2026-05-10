import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

const log = logger.child({ component: "middleware" });

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const start = Date.now();

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

  // Redirect root to /zh/
  if (pathname === "/") {
    const response = NextResponse.redirect(new URL("/zh/", request.url));
    log.info({
      method: request.method,
      pathname,
      status: response.status,
      duration: Date.now() - start,
    });
    return response;
  }

  const response = NextResponse.next();
  log.info({
    method: request.method,
    pathname,
    status: response.status,
    duration: Date.now() - start,
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|admin).*)"],
};