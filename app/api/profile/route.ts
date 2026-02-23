import { db } from "@/src/db";
import { korisnik } from "@/src/db/schema";
import { calculatePremiumPlan } from "@/src/lib/premiumPlan";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

function getUserPayload(req: Request): { id: string } | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  try {
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as { id: string };
  } catch {
    return null;
  }
}

function toNumberOrNull(value: unknown): number | null {
  if (value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

async function getCurrentUserByRequest(req: Request) {
  const payload = getUserPayload(req);
  if (!payload?.id) return null;

  const userId = BigInt(payload.id);
  const rows = await db
    .select()
    .from(korisnik)
    .where(eq(korisnik.korisnikId, userId));

  if (!rows.length) return null;

  return rows[0];
}

export async function GET(req: Request) {
  const user = await getCurrentUserByRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Niste ulogovani" }, { status: 401 });
  }
  const tezina = toNumberOrNull(user.tezina);
  const visina = toNumberOrNull(user.visina);
  const ciljnaTezina = toNumberOrNull(user.ciljnaTezina);
  const isPremium = String(user.uloga ?? "").toUpperCase() === "PREMIUM";

  const premiumPlan =
    isPremium && tezina != null && visina != null && ciljnaTezina != null
      ? calculatePremiumPlan({
          tezinaKg: tezina,
          visinaCm: visina,
          ciljnaTezinaKg: ciljnaTezina,
        })
      : null;

  return NextResponse.json({
    user: {
      id: user.korisnikId.toString(),
      ime: user.ime,
      email: user.email,
      uloga: user.uloga,
      tezina,
      visina,
      ciljnaTezina,
    },
    premiumPlan,
  });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUserByRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Niste ulogovani" }, { status: 401 });
  }

  const body = await req.json();
  const action = String(body?.action ?? "");

  if (action === "upgradePremium") {
    const tezina = Number(body?.tezina);
    const visina = Number(body?.visina);
    const ciljnaTezina = Number(body?.ciljnaTezina);

    if (!Number.isFinite(tezina) || tezina <= 0) {
      return NextResponse.json(
        { error: "Unesite ispravnu trenutnu tezinu" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(visina) || visina <= 0) {
      return NextResponse.json(
        { error: "Unesite ispravnu visinu" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(ciljnaTezina) || ciljnaTezina <= 0) {
      return NextResponse.json(
        { error: "Unesite ispravnu ciljnu tezinu" },
        { status: 400 },
      );
    }

    await db
      .update(korisnik)
      .set({
        uloga: "PREMIUM",
        tezina: String(tezina),
        visina: String(visina),
        ciljnaTezina: String(ciljnaTezina),
      })
      .where(eq(korisnik.korisnikId, user.korisnikId));

    return NextResponse.json({ message: "Nalog je unapredjen na premium" });
  }

  const isPremium = String(user.uloga ?? "").toUpperCase() === "PREMIUM";
  if (!isPremium) {
    return NextResponse.json(
      { error: "Azuriranje tezine je dostupno samo premium korisniku" },
      { status: 403 },
    );
  }
  const rawTezina = body?.tezina;
  const tezina = Number(rawTezina);

  if (!Number.isFinite(tezina) || tezina <= 0) {
    return NextResponse.json(
      { error: "Tezina mora biti pozitivan broj" },
      { status: 400 },
    );
  }

  await db
    .update(korisnik)
    .set({ tezina: String(tezina) })
    .where(eq(korisnik.korisnikId, user.korisnikId));

  return NextResponse.json({ message: "Tezina je uspesno azurirana" });
}
