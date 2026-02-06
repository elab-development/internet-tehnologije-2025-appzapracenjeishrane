import { db } from "@/src/db";
import { konzumiranahrana } from "@/src/db/schema";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

function getUserId(req: Request): bigint | null {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    return BigInt(payload.id);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Niste ulogovani" }, { status: 401 });
  }

  const body = await req.json();
  const hranaIdRaw = body?.hranaId;
  const datum = String(body?.datum ?? "");
  const kolicinaRaw = body?.kolicina;

  if (!hranaIdRaw || !datum || kolicinaRaw == null) {
    return NextResponse.json(
      { error: "Hrana, datum i količina su obavezni" },
      { status: 400 },
    );
  }

  const hranaId = BigInt(hranaIdRaw);
  const kolicina = String(kolicinaRaw); // Drizzle decimal je često string

  await db.insert(konzumiranahrana).values({
    korisnikId: userId,
    hranaId,
    datumKh: datum,
    kolicina,
  });

  return NextResponse.json({ message: "Unos sačuvan" });
}
