import { mysqlTable, mysqlSchema, AnyMySqlColumn, varchar, decimal, foreignKey, date } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const aktivnost = mysqlTable("aktivnost", {
	aktivnostId: bigint({ mode: "number" }).autoincrement().notNull(),
	nazivAktivnosti: varchar({ length: 50 }).default('NULL'),
	prosekKalorija: decimal({ precision: 10, scale: 2 }).default('NULL'),
});

export const hrana = mysqlTable("hrana", {
	hranaId: bigint({ mode: "number" }).notNull(),
	nazivHrane: varchar({ length: 50 }).default('NULL'),
	kalorije: decimal({ precision: 10, scale: 2 }).default('NULL'),
	proteini: decimal({ precision: 10, scale: 2 }).default('NULL'),
	masti: decimal({ precision: 10, scale: 2 }).default('NULL'),
	ugljeniHidrati: decimal({ precision: 10, scale: 2 }).default('NULL'),
	prihvacena: tinyint().default('NULL'),
});

export const konzumiranahrana = mysqlTable("konzumiranahrana", {
	khId: bigint("KHId", { mode: "number" }).notNull(),
	korisnik: bigint({ mode: "number" }).default('NULL').references(() => korisnik.korisnikId, { onDelete: "restrict", onUpdate: "restrict" } ),
	hrana: bigint({ mode: "number" }).default('NULL').references(() => hrana.hranaId, { onDelete: "restrict", onUpdate: "restrict" } ),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	datumKh: date({ mode: 'string' }).default('NULL'),
});

export const korisnik = mysqlTable("korisnik", {
	korisnikId: bigint({ mode: "number" }).autoincrement().notNull(),
	email: varchar({ length: 50 }).default('NULL'),
	sifra: varchar({ length: 20 }).default('NULL'),
	uloga: varchar({ length: 40 }).default('NULL'),
	tezina: decimal({ precision: 10, scale: 2 }).default('NULL'),
	visina: decimal({ precision: 10, scale: 2 }).default('NULL'),
	ime: varchar({ length: 50 }).default('NULL'),
	ciljnaTezina: decimal({ precision: 10, scale: 2 }).default('NULL'),
});

export const odradjeneaktivnosti = mysqlTable("odradjeneaktivnosti", {
	oaId: bigint("OAId", { mode: "number" }).autoincrement().notNull(),
	korisnik: bigint({ mode: "number" }).default('NULL').references(() => korisnik.korisnikId, { onDelete: "restrict", onUpdate: "restrict" } ),
	aktivnost: bigint({ mode: "number" }).default('NULL').references(() => aktivnost.aktivnostId, { onDelete: "restrict", onUpdate: "restrict" } ),
	trajanjeMin: decimal().default('NULL'),
	potroseneKalorije: decimal().default('NULL'),
	// you can use { mode: 'date' }, if you want to have Date as type for this column
	datumOa: date({ mode: 'string' }).default('NULL'),
});
