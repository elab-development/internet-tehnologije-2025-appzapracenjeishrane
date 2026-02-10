import { db } from "@/src/db";
import { aktivnost } from "@/src/db/schema";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

function isAuthed(req: Request) {
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
  const result = await db.select().from(aktivnost);

  const safe = result.map((r: any) => ({
    ...r,
    aktivnostId: r.aktivnostId?.toString?.() ?? r.aktivnostId,
  }));

  return NextResponse.json(safe);
}

export async function POST(req: Request) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Niste ulogovani" }, { status: 401 });
  }

  const body = await req.json();
  const { nazivAktivnosti, prosekKalorija } = body ?? {};

  if (!nazivAktivnosti) {
    return NextResponse.json(
      { error: "Naziv aktivnosti je obavezan" },
      { status: 400 },
    );
  }

  const kcal = Number(prosekKalorija);
  if (!Number.isFinite(kcal) || kcal < 0) {
    return NextResponse.json(
      { error: "Prosek kalorija mora biti broj >= 0" },
      { status: 400 },
    );
  }

  await db.insert(aktivnost).values({
    nazivAktivnosti: String(nazivAktivnosti).trim(),
    prosekKalorija: String(kcal),
  } as any);

  return NextResponse.json({ message: "Aktivnost dodata ✅" });
}
