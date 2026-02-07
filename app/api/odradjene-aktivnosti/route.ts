import { db } from "@/src/db";
import { odradjeneaktivnosti, aktivnost } from "@/src/db/schema";
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

// GET /api/odradjene-aktivnosti?datum=YYYY-MM-DD -> dnevni unosi + total
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
      nazivAktivnosti: aktivnost.nazivAktivnosti,
      prosekKalorija: aktivnost.prosekKalorija,
      trajanjeMin: odradjeneaktivnosti.trajanjeMin,
      potroseneKalorije: odradjeneaktivnosti.potroseneKalorije,
    })
    .from(odradjeneaktivnosti)
    .innerJoin(
      aktivnost,
      eq(odradjeneaktivnosti.aktivnostId, aktivnost.aktivnostId),
    )
    .where(
      and(
        eq(odradjeneaktivnosti.korisnikId, userId),
        eq(odradjeneaktivnosti.datumOa, datum),
      ),
    );

  const totalBurned = rows.reduce(
    (acc, r) => acc + Number(r.potroseneKalorije || 0),
    0,
  );

  return NextResponse.json({
    items: rows,
    totals: { potroseneKalorije: totalBurned },
  });
}

// POST /api/odradjene-aktivnosti { aktivnostId, datum, trajanjeMin }
export async function POST(req: Request) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Niste ulogovani" }, { status: 401 });
  }

  const body = await req.json();
  const { aktivnostId, datum, trajanjeMin } = body ?? {};

  if (!aktivnostId || !datum || trajanjeMin == null) {
    return NextResponse.json(
      { error: "Aktivnost, datum i trajanje su obavezni" },
      { status: 400 },
    );
  }

  const mins = Number(trajanjeMin);
  if (!Number.isFinite(mins) || mins <= 0) {
    return NextResponse.json(
      { error: "Trajanje mora biti pozitivan broj" },
      { status: 400 },
    );
  }

  // uzmi prosek kalorija
  const act = await db
    .select()
    .from(aktivnost)
    .where(eq(aktivnost.aktivnostId, BigInt(aktivnostId)));

  if (act.length === 0) {
    return NextResponse.json(
      { error: "Aktivnost ne postoji" },
      { status: 400 },
    );
  }

  const kcalPerHour = Number(act[0].prosekKalorija ?? 0);
  const burned = (mins / 60) * kcalPerHour;

  await db.insert(odradjeneaktivnosti).values({
    korisnikId: userId,
    aktivnostId: BigInt(aktivnostId),
    datumOa: String(datum),
    trajanjeMin: String(mins),
    potroseneKalorije: String(burned),
  } as any);

  return NextResponse.json({
    message: "Aktivnost sačuvana ✅",
    potroseneKalorije: burned,
  });
}
