import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Simple in-memory rate limiter for middleware (Edge-compatible).
 * No setInterval — uses lazy cleanup on each check.
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const CLEANUP_THRESHOLD = 10_000; // clean up when map gets large
let lastCleanup = Date.now();

function middlewareRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();

  // Lazy cleanup every 5 minutes or when store is large
  if (now - lastCleanup > 300_000 || rateLimitStore.size > CLEANUP_THRESHOLD) {
    for (const [k, v] of rateLimitStore) {
      if (now > v.resetTime) rateLimitStore.delete(k);
    }
    lastCleanup = now;
  }

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) };
  }

  record.count++;
  return { allowed: true };
}

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    request.ip ||
    "unknown"
  );
}

// Rate limit tiers (requests per window)
const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/chat":       { max: 20, windowMs: 60_000 },    // 20/min — expensive Claude calls
  "/api/upload":     { max: 10, windowMs: 60_000 },     // 10/min — file uploads
  "/api/admin":      { max: 30, windowMs: 60_000 },     // 30/min — admin operations
  "/api":            { max: 60, windowMs: 60_000 },      // 60/min — all other API routes
};

function getRateLimit(pathname: string) {
  // Match most specific prefix first
  if (pathname.startsWith("/api/chat")) return RATE_LIMITS["/api/chat"];
  if (pathname.startsWith("/api/upload")) return RATE_LIMITS["/api/upload"];
  if (pathname.startsWith("/api/admin")) return RATE_LIMITS["/api/admin"];
  if (pathname.startsWith("/api")) return RATE_LIMITS["/api"];
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting to all API routes
  if (pathname.startsWith("/api")) {
    const ip = getClientIP(request);
    const limit = getRateLimit(pathname);

    if (limit) {
      const result = middlewareRateLimit(`${pathname}:${ip}`, limit.max, limit.windowMs);

      if (!result.allowed) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          {
            status: 429,
            headers: {
              "Retry-After": String(result.retryAfter ?? 60),
              "X-RateLimit-Limit": String(limit.max),
            },
          }
        );
      }
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
