import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).origin === req.nextUrl.origin;
  } catch {
    return false;
  }
}

function applySecurityHeaders(req: NextRequest, res: NextResponse, isApi: boolean) {
  const isDev = process.env.NODE_ENV !== "production";
  const connectSrc = isDev
    ? "connect-src 'self' ws: wss: https://api.open-meteo.com https://geocoding-api.open-meteo.com"
    : "connect-src 'self' https://api.open-meteo.com https://geocoding-api.open-meteo.com";
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://www.gstatic.com"
    : "script-src 'self' 'unsafe-inline' https://unpkg.com https://www.gstatic.com";

  const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://unpkg.com",
    "img-src 'self' data: https:",
    "font-src 'self' data: https:",
    connectSrc,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  if (isApi) {
    res.headers.set("Access-Control-Allow-Origin", req.nextUrl.origin);
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
    res.headers.set("Vary", "Origin");
  }

  return res;
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isApi = pathname.startsWith("/api/");

  if (isApi && req.method === "OPTIONS") {
    return applySecurityHeaders(req, new NextResponse(null, { status: 204 }), true);
  }

  if (isApi && MUTATING_METHODS.has(req.method) && !isSameOrigin(req)) {
    return applySecurityHeaders(
      req,
      NextResponse.json(
        { error: "Cross-site zahtevi nisu dozvoljeni" },
        { status: 403 },
      ),
      true,
    );
  }

  if (pathname.startsWith("/api/protected/")) {
    const auth = req.headers.get("authorization");

    if (!auth) {
      return applySecurityHeaders(
        req,
        NextResponse.json({ error: "Niste ulogovani" }, { status: 401 }),
        true,
      );
    }

    const parts = auth.split(" ");
    const token = parts[0] === "Bearer" && parts.length === 2 ? parts[1] : null;
    if (!token) {
      return applySecurityHeaders(
        req,
        NextResponse.json({ error: "Nevazeci token" }, { status: 401 }),
        true,
      );
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return applySecurityHeaders(req, NextResponse.next(), true);
    } catch {
      return applySecurityHeaders(
        req,
        NextResponse.json({ error: "Nevazeci token" }, { status: 401 }),
        true,
      );
    }
  }

  return applySecurityHeaders(req, NextResponse.next(), isApi);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
