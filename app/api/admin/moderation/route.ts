import { db } from "@/src/db";
import { aktivnost, hrana } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

type TokenPayload = {
  id?: string;
  email?: string;
  uloga?: string;
};

function requireAdmin(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Niste ulogovani" },
        { status: 401 },
      ),
    };
  }

  try {
    const payload = jwt.verify(
      auth.slice(7),
      process.env.JWT_SECRET as string,
    ) as TokenPayload;

    if (payload.uloga !== "ADMIN") {
      return {
        ok: false as const,
        response: NextResponse.json(
          { error: "Samo admin ima pristup" },
          { status: 403 },
        ),
      };
    }

    return { ok: true as const };
  } catch {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Nevazeci token" }, { status: 401 }),
    };
  }
}

export async function GET(req: Request) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;

  const [pendingHrana, pendingAktivnosti] = await Promise.all([
    db.select().from(hrana).where(eq(hrana.prihvacena, 0)),
    db.select().from(aktivnost).where(eq(aktivnost.prihvacena, 0)),
  ]);

  return NextResponse.json({
    hrana: pendingHrana.map((r: any) => ({
      ...r,
      hranaId: r.hranaId?.toString?.() ?? r.hranaId,
    })),
    aktivnosti: pendingAktivnosti.map((r: any) => ({
      ...r,
      aktivnostId: r.aktivnostId?.toString?.() ?? r.aktivnostId,
    })),
  });
}

export async function PATCH(req: Request) {
  const auth = requireAdmin(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const entity = String(body?.entity ?? "");
  const action = String(body?.action ?? "");
  const status = action === "accept" ? 1 : action === "reject" ? -1 : null;

  if (status == null) {
    return NextResponse.json({ error: "Neispravna akcija" }, { status: 400 });
  }

  if (entity === "hrana") {
    if (body?.id == null) {
      return NextResponse.json(
        { error: "ID hrane je obavezan" },
        { status: 400 },
      );
    }

    await db
      .update(hrana)
      .set({ prihvacena: status } as any)
      .where(and(eq(hrana.hranaId, BigInt(body.id)), eq(hrana.prihvacena, 0)));

    return NextResponse.json({ message: "Status hrane azuriran" });
  }

  if (entity === "aktivnost") {
    if (body?.id == null) {
      return NextResponse.json(
        { error: "ID aktivnosti je obavezan" },
        { status: 400 },
      );
    }

    await db
      .update(aktivnost)
      .set({ prihvacena: status } as any)
      .where(
        and(
          eq(aktivnost.aktivnostId, BigInt(body.id)),
          eq(aktivnost.prihvacena, 0),
        ),
      );

    return NextResponse.json({ message: "Status aktivnosti azuriran" });
  }

  return NextResponse.json({ error: "Nepoznat tip entiteta" }, { status: 400 });
}
