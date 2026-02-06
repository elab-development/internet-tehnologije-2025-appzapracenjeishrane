import { db } from "@/src/db";
import { hrana } from "@/src/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await db.select().from(hrana);

  const safe = result.map((r) => ({
    ...r,
    hranaId: r.hranaId?.toString(), // BigInt -> string
  }));

  return NextResponse.json(safe);
}
