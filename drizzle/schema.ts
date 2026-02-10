import {
  mysqlTable,
  varchar,
  decimal,
  date,
  bigint,
  tinyint,
} from "drizzle-orm/mysql-core";

/* ===================== AKTIVNOST ===================== */
export const aktivnost = mysqlTable("aktivnost", {
  aktivnostId: bigint("aktivnostId", { mode: "bigint" })
    .autoincrement()
    .primaryKey(),

  nazivAktivnosti: varchar("nazivAktivnosti", { length: 50 }),
  prosekKalorija: decimal("prosekKalorija", { precision: 10, scale: 2 }),
});

/* ===================== HRANA ===================== */
export const hrana = mysqlTable("hrana", {
  hranaId: bigint("hranaId", { mode: "bigint" }).primaryKey(),

  nazivHrane: varchar("nazivHrane", { length: 50 }),
  kalorije: decimal("kalorije", { precision: 10, scale: 2 }),
  proteini: decimal("proteini", { precision: 10, scale: 2 }),
  masti: decimal("masti", { precision: 10, scale: 2 }),
  ugljeniHidrati: decimal("ugljeniHidrati", { precision: 10, scale: 2 }),
  prihvacena: tinyint("prihvacena"),
});

/* ===================== KORISNIK ===================== */
export const korisnik = mysqlTable("korisnik", {
  korisnikId: bigint("korisnikId", { mode: "bigint" })
    .autoincrement()
    .primaryKey(),

  email: varchar("email", { length: 50 }),
  sifra: varchar("sifra", { length: 255 }), // bcrypt hash
  uloga: varchar("uloga", { length: 40 }),
  ime: varchar("ime", { length: 50 }),

  tezina: decimal("tezina", { precision: 10, scale: 2 }),
  visina: decimal("visina", { precision: 10, scale: 2 }),
  ciljnaTezina: decimal("ciljnaTezina", { precision: 10, scale: 2 }),
});

/* ===================== KONZUMIRANA HRANA ===================== */
export const konzumiranahrana = mysqlTable("konzumiranahrana", {
  khId: bigint("KHId", { mode: "bigint" }).autoincrement().primaryKey(),
  korisnikId: bigint("korisnik", { mode: "bigint" }).references(
    () => korisnik.korisnikId,
    { onDelete: "restrict", onUpdate: "restrict" },
  ),

  hranaId: bigint("hrana", { mode: "bigint" }).references(() => hrana.hranaId, {
    onDelete: "restrict",
    onUpdate: "restrict",
  }),

  datumKh: date("datumKH", { mode: "string" }),

  kolicina: decimal("kolicina", { precision: 10, scale: 2 }),
});

/* ===================== ODRADJENE AKTIVNOSTI ===================== */
export const odradjeneaktivnosti = mysqlTable("odradjeneaktivnosti", {
  oaId: bigint("oaId", { mode: "bigint" }).autoincrement().primaryKey(),

  korisnikId: bigint("korisnik", { mode: "bigint" }).references(
    () => korisnik.korisnikId,
    { onDelete: "restrict", onUpdate: "restrict" },
  ),

  aktivnostId: bigint("aktivnost", { mode: "bigint" }).references(
    () => aktivnost.aktivnostId,
    { onDelete: "restrict", onUpdate: "restrict" },
  ),

  trajanjeMin: decimal("trajanjeMin", { precision: 10, scale: 2 }),
  potroseneKalorije: decimal("potroseneKalorije", {
    precision: 10,
    scale: 2,
  }),

  datumOa: date("datumOa", { mode: "string" }),
});
