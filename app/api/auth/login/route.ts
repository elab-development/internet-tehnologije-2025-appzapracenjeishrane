import { db } from "@/src/db";
import { korisnik } from "@/src/db/schema";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    console.log("LOGIN: DATABASE_URL =", process.env.DATABASE_URL);

    const body = await req.json();

    const rawEmail = body?.email;
    const rawSifra = body?.sifra;

    const email = String(rawEmail ?? "")
      .trim()
      .toLowerCase();
    const sifra = String(rawSifra ?? ""); // bez trim

    console.log("LOGIN body:", { rawEmail, email, sifraLen: sifra.length });

    if (!email || !sifra) {
      return NextResponse.json(
        { error: "Email i lozinka su obavezni" },
        { status: 400 },
      );
    }

    const result = await db
      .select()
      .from(korisnik)
      .where(eq(korisnik.email, email));

    console.log("LOGIN db match count:", result.length);

    if (result.length === 0) {
      const all = await db.select().from(korisnik);
      console.log(
        "LOGIN ALL USERS (emails):",
        all.map((u: any) => u.email),
      );

      return NextResponse.json(
        { error: "Pogrešan email ili lozinka" },
        { status: 401 },
      );
    }

    const user = result[0];

    console.log("LOGIN db email:", user.email);
    console.log("LOGIN db hash:", user.sifra);
    console.log(
      "LOGIN db hash startsWith $2:",
      String(user.sifra).startsWith("$2"),
    );

    const valid = await bcrypt.compare(sifra, String(user.sifra));
    console.log("LOGIN bcrypt valid:", valid);

    if (!valid) {
      return NextResponse.json(
        { error: "Pogrešan email ili lozinka" },
        { status: 401 },
      );
    }

    const token = jwt.sign(
      { id: user.korisnikId.toString(), email: user.email, uloga: user.uloga },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" },
    );

    return NextResponse.json({
      token,
      user: {
        id: user.korisnikId.toString(),
        email: user.email,
        ime: user.ime,
        uloga: user.uloga,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}
