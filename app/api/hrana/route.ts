import { db } from "@/src/db";
import { hrana } from "@/src/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

function isAuthed(req: Request): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  try {
    jwt.verify(auth.slice(7), process.env.JWT_SECRET!);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const result = await db.select().from(hrana).where(eq(hrana.prihvacena, 1));

  const safe = result.map((r: any) => ({
    ...r,
    hranaId: r.hranaId?.toString?.() ?? r.hranaId,
  }));

  return NextResponse.json(safe);
}

export async function POST(req: Request) {
  try {
    if (!isAuthed(req)) {
      return NextResponse.json({ error: "Niste ulogovani" }, { status: 401 });
    }

    const body = await req.json();
    const { nazivHrane, kalorije, proteini, masti, ugljeniHidrati } = body ?? {};

    if (!nazivHrane) {
      return NextResponse.json(
        { error: "Naziv hrane je obavezan" },
        { status: 400 },
      );
    }

    const toStr = (v: any) => {
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0) return null;
      return String(n);
    };

    const kcal = toStr(kalorije);
    const p = toStr(proteini);
    const f = toStr(masti);
    const uh = toStr(ugljeniHidrati);

    if ([kcal, p, f, uh].some((x) => x == null)) {
      return NextResponse.json(
        { error: "Nutritivne vrednosti moraju biti brojevi >= 0" },
        { status: 400 },
      );
    }

    const latest = await db
      .select({ hranaId: hrana.hranaId })
      .from(hrana)
      .orderBy(desc(hrana.hranaId))
      .limit(1);

    const nextHranaId =
      latest.length > 0 && latest[0].hranaId != null
        ? BigInt(latest[0].hranaId as any) + BigInt(1)
        : BigInt(1001);

    await db.insert(hrana).values({
      hranaId: nextHranaId,
      nazivHrane: String(nazivHrane).trim(),
      kalorije: kcal,
      proteini: p,
      masti: f,
      ugljeniHidrati: uh,
      prihvacena: 0,
    } as any);

    return NextResponse.json({ message: "Hrana je poslata na odobrenje" });
  } catch (err) {
    console.error("HRANA POST ERROR:", err);
    return NextResponse.json(
      { error: "Greska pri dodavanju hrane" },
      { status: 500 },
    );
  }
}
