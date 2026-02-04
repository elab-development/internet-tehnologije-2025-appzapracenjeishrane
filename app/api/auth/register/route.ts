import { db } from "@/src/db";
import { korisnik } from "@/src/db/schema";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    console.log("REGISTER: DATABASE_URL =", process.env.DATABASE_URL);

    const body = await req.json();

    const rawEmail = body?.email;
    const rawSifra = body?.sifra;
    const rawIme = body?.ime;

    const email = String(rawEmail ?? "")
      .trim()
      .toLowerCase();
    const sifra = String(rawSifra ?? ""); // bez trim
    const ime = String(rawIme ?? "").trim();

    const tezina = body?.tezina ?? null;
    const visina = body?.visina ?? null;
    const ciljnaTezina = body?.ciljnaTezina ?? null;

    console.log("REGISTER body:", {
      rawEmail,
      email,
      sifraLen: sifra.length,
      imeLen: ime.length,
      tezina,
      visina,
      ciljnaTezina,
    });

    if (!email || !sifra || !ime) {
      return NextResponse.json(
        { error: "Email, lozinka i ime su obavezni" },
        { status: 400 },
      );
    }

    const postoji = await db
      .select()
      .from(korisnik)
      .where(eq(korisnik.email, email));

    console.log("REGISTER existing count:", postoji.length);

    if (postoji.length > 0) {
      return NextResponse.json({ error: "Email već postoji" }, { status: 400 });
    }

    const hash = await bcrypt.hash(sifra, 10);
    console.log("REGISTER hash startsWith $2:", hash.startsWith("$2"));

    const insertRes = await db.insert(korisnik).values({
      email,
      sifra: hash,
      ime,
      tezina,
      visina,
      ciljnaTezina,
      uloga: "OBICAN",
    });

    console.log("REGISTER insert result:", insertRes);

    // Provera odmah posle inserta (da vidimo da li je stvarno u toj bazi)
    const check = await db
      .select()
      .from(korisnik)
      .where(eq(korisnik.email, email));

    console.log("REGISTER post-insert check count:", check.length);
    if (check[0]) {
      console.log("REGISTER saved email:", check[0].email);
      console.log(
        "REGISTER saved hash startsWith $2:",
        String(check[0].sifra).startsWith("$2"),
      );
    }

    return NextResponse.json({ message: "Uspešna registracija" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}
