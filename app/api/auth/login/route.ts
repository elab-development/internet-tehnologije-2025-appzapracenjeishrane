import { db } from "@/src/db";
import { korisnik } from "@/src/db/schema";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const { email, sifra } = await req.json();

  const result = await db
    .select()
    .from(korisnik)
    .where(eq(korisnik.email, email));

  if (result.length === 0) {
    return NextResponse.json(
      { error: "Pogrešan email ili lozinka" },
      { status: 401 },
    );
  }

  const user = result[0];

  const valid = await bcrypt.compare(sifra, user.sifra!);
  if (!valid) {
    return NextResponse.json(
      { error: "Pogrešan email ili lozinka" },
      { status: 401 },
    );
  }

  // JWT
  const token = jwt.sign(
    {
      id: user.korisnikId,
      email: user.email,
      uloga: user.uloga,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" },
  );

  return NextResponse.json({
    token,
    user: {
      id: user.korisnikId,
      email: user.email,
      ime: user.ime,
      uloga: user.uloga,
    },
  });
}
