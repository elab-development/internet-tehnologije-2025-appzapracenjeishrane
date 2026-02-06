import { db } from "@/src/db";
import { unosvode } from "@/src/db/schema";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { and, eq } from "drizzle-orm";

function getUserId(req: Request): bigint | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  try {
    const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as any;
    return BigInt(payload.id);
  } catch {
    return null;
  }
}

// GET /api/water?datum=YYYY-MM-DD  -> vraca kolicinu za taj dan
export async function GET(req: Request) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Niste ulogovani" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const datum = searchParams.get("datum");
  if (!datum) {
    return NextResponse.json({ error: "Datum je obavezan" }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(unosvode)
    .where(and(eq(unosvode.korisnikId, userId), eq(unosvode.datum, datum)));

  const kolicinaMl = rows.length ? Number(rows[0].kolicinaMl) : 0;

  return NextResponse.json({ datum, kolicinaMl });
}

// POST /api/water  { datum, kolicinaMl }  -> upsert (setuje vrednost)
export async function POST(req: Request) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Niste ulogovani" }, { status: 401 });
  }

  const body = await req.json();
  const { datum, kolicinaMl } = body ?? {};

  if (!datum || kolicinaMl == null) {
    return NextResponse.json(
      { error: "Datum i kolicinaMl su obavezni" },
      { status: 400 },
    );
  }

  const amount = Number(kolicinaMl);
  if (!Number.isFinite(amount) || amount < 0) {
    return NextResponse.json(
      { error: "kolicinaMl mora biti broj >= 0" },
      { status: 400 },
    );
  }

  // Upsert zahvaljujući UNIQUE(korisnik, datum)
  await db
    .insert(unosvode)
    .values({
      korisnikId: userId,
      datum: String(datum),
      kolicinaMl: amount,
    })
    .onDuplicateKeyUpdate({
      set: { kolicinaMl: amount },
    });

  return NextResponse.json({
    message: "Unos vode sacuvan ✅",
    datum,
    kolicinaMl: amount,
  });
}
