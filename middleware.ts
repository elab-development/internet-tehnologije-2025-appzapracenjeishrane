import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const auth = req.headers.get("authorization");

  if (!auth) {
    return NextResponse.json({ error: "Niste ulogovani" }, { status: 401 });
  }

  const token = auth.split(" ")[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch {
    return NextResponse.json({ error: "Nevažeći token" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/protected/:path*"],
};
