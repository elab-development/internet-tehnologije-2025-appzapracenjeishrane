import { db } from "@/src/db";
import { korisnik } from "@/src/db/schema";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, sifra, ime, tezina, visina, ciljnaTezina } = body;

    if (!email || !sifra || !ime) {
      return NextResponse.json(
        { error: "Email, lozinka i ime su obavezni" },
        { status: 400 },
      );
    }

    // 1. Provera da li email postoji
    const postoji = await db
      .select()
      .from(korisnik)
      .where(eq(korisnik.email, email));

    if (postoji.length > 0) {
      return NextResponse.json({ error: "Email već postoji" }, { status: 400 });
    }

    // 2. Hash lozinke
    const hash = await bcrypt.hash(sifra, 10);

    // 3. Insert korisnika
    await db.insert(korisnik).values({
      email,
      sifra: hash,
      ime,
      tezina,
      visina,
      ciljnaTezina,
      uloga: "OBICAN",
    });

    return NextResponse.json({ message: "Uspešna registracija" });
  } catch (err) {
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}
