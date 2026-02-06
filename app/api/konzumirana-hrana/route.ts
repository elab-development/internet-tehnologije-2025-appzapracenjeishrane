import { db } from "@/src/db";
import { konzumiranahrana, hrana } from "@/src/db/schema";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { eq, and } from "drizzle-orm";

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

// ✅ GET: vrati dnevne unose + totale
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
    .select({
      nazivHrane: hrana.nazivHrane,
      kalorije: hrana.kalorije,
      proteini: hrana.proteini,
      masti: hrana.masti,
      ugljeniHidrati: hrana.ugljeniHidrati,
      kolicina: konzumiranahrana.kolicina,
    })
    .from(konzumiranahrana)
    .innerJoin(hrana, eq(konzumiranahrana.hranaId, hrana.hranaId))
    .where(
      and(
        eq(konzumiranahrana.korisnikId, userId),
        eq(konzumiranahrana.datumKh, datum),
      ),
    );

  let totals = { kalorije: 0, proteini: 0, masti: 0, ugljeniHidrati: 0 };

  rows.forEach((r) => {
    const factor = Number(r.kolicina) / 100;
    totals.kalorije += Number(r.kalorije) * factor;
    totals.proteini += Number(r.proteini) * factor;
    totals.masti += Number(r.masti) * factor;
    totals.ugljeniHidrati += Number(r.ugljeniHidrati) * factor;
  });

  return NextResponse.json({ items: rows, totals });
}

// ✅ POST: dodaj novi unos (nema zabrane da ista hrana ide više puta u danu)
export async function POST(req: Request) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Niste ulogovani" }, { status: 401 });
  }

  const body = await req.json();
  const { hranaId, datum, kolicina } = body ?? {};

  if (!hranaId || !datum || kolicina == null) {
    return NextResponse.json(
      { error: "Hrana, datum i količina su obavezni" },
      { status: 400 },
    );
  }

  await db.insert(konzumiranahrana).values({
    korisnikId: userId,
    hranaId: BigInt(hranaId),
    datumKh: String(datum),
    kolicina: String(kolicina),
  });

  return NextResponse.json({ message: "Unos sačuvan ✅" });
}
