import { relations } from "drizzle-orm/relations";
import { hrana, konzumiranahrana, korisnik, aktivnost, odradjeneaktivnosti } from "./schema";

export const konzumiranahranaRelations = relations(konzumiranahrana, ({one}) => ({
	hrana: one(hrana, {
		fields: [konzumiranahrana.hrana],
		references: [hrana.hranaId]
	}),
	korisnik: one(korisnik, {
		fields: [konzumiranahrana.korisnik],
		references: [korisnik.korisnikId]
	}),
}));

export const hranaRelations = relations(hrana, ({many}) => ({
	konzumiranahranas: many(konzumiranahrana),
}));

export const korisnikRelations = relations(korisnik, ({many}) => ({
	konzumiranahranas: many(konzumiranahrana),
	odradjeneaktivnostis: many(odradjeneaktivnosti),
}));

export const odradjeneaktivnostiRelations = relations(odradjeneaktivnosti, ({one}) => ({
	aktivnost: one(aktivnost, {
		fields: [odradjeneaktivnosti.aktivnost],
		references: [aktivnost.aktivnostId]
	}),
	korisnik: one(korisnik, {
		fields: [odradjeneaktivnosti.korisnik],
		references: [korisnik.korisnikId]
	}),
}));

export const aktivnostRelations = relations(aktivnost, ({many}) => ({
	odradjeneaktivnostis: many(odradjeneaktivnosti),
}));