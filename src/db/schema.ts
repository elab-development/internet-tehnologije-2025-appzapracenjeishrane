import { mysqlTable, bigint, varchar, decimal } from "drizzle-orm/mysql-core";

export const korisnik = mysqlTable("korisnik", {
  korisnikId: bigint("korisnikId", { mode: "number" })
    .primaryKey()
    .autoincrement(),

  email: varchar("email", { length: 50 }),

  sifra: varchar("sifra", { length: 20 }),

  uloga: varchar("uloga", { length: 40 }),

  tezina: decimal("tezina", { precision: 10, scale: 2 }),

  visina: decimal("visina", { precision: 10, scale: 2 }),

  ime: varchar("ime", { length: 50 }),

  ciljnaTezina: decimal("ciljnaTezina", { precision: 10, scale: 2 }),
});
