# MyDietApp - Aplikacija za pracenje ishrane i aktivnosti

Web aplikacija za pracenje unosa hrane, fizickih aktivnosti i vode, sa podrskom za korisnicke uloge (`OBICAN`, `PREMIUM`, `ADMIN`), premium plan kalkulacije i admin moderaciju korisnickih unosa.

## Tehnologije

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- MySQL 8
- Drizzle ORM + Drizzle Kit
- JWT autentikacija
- Docker / Docker Compose
- Swagger UI (OpenAPI)

## Glavne funkcionalnosti

- Registracija i login korisnika (JWT token)
- Korisnicki profil (`/profile`)
- Premium upgrade i racunanje premium plana (kalorije, makroi, voda, BMI)
- Evidencija:
- unos hrane
- unos aktivnosti
- unos vode
- Pregled dnevnih unosa hrane i aktivnosti
- Admin panel (`/admin`) za moderaciju:
- prihvatanje/odbijanje novih unosa hrane
- prihvatanje/odbijanje novih aktivnosti
- Swagger dokumentacija (`/swagger`)

## Uloge korisnika

- `OBICAN` - osnovne funkcionalnosti aplikacije
- `PREMIUM` - premium plan i dodatne metrike
- `ADMIN` - pristup admin panelu i moderaciji

## Struktura projekta (skraceno)

- `app/` - Next.js stranice i API rute
- `app/api/` - backend API endpointi
- `app/swagger/page.tsx` - Swagger UI stranica
- `src/db/` - Drizzle konekcija, schema i relacije
- `src/lib/` - OpenAPI specifikacija i premium logika
- `drizzle/` - Drizzle migracije / metadata
- `Dockerfile` - Docker image za Next.js app
- `docker-compose.yml` - MySQL + app servisi

## API rute (pregled)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET/PATCH /api/profile`
- `GET/POST /api/hrana`
- `GET/POST /api/aktivnost`
- `GET/POST /api/konzumirana-hrana`
- `GET/POST /api/odradjene-aktivnosti`
- `GET/POST /api/water`
- `GET/PATCH /api/admin/moderation` (admin only)
- `GET /api/openapi` (OpenAPI JSON)

## Swagger / OpenAPI

- Swagger UI: `http://localhost:3000/swagger`
- OpenAPI JSON: `http://localhost:3000/api/openapi`

Za zasticene rute koristi header:

```http
Authorization: Bearer <token>
```

Token se dobija iz odgovora `POST /api/auth/login`.

## Preduslovi

- Node.js 20+
- npm
- MySQL 8 (lokalno ili preko Docker-a)

## Environment promenljive

Napraviti `.env` fajl (ili koristiti `.env.example` kao osnovu):

```env
DATABASE_URL=mysql://root:YOUR_PASSWORD@localhost:3306/ishrana
JWT_SECRET=replace_with_strong_secret

# opciono - za drizzle.config.ts (ako ne koristis DATABASE_URL-only setup)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=ishrana
```

Napomena:

- Aplikacija koristi `DATABASE_URL` za konekciju (`src/db/index.ts`)
- `drizzle.config.ts` koristi `DB_*` promenljive (ima i default vrednosti)

## Pokretanje lokalno (bez Docker-a)

1. Instaliraj dependencies:

```bash
npm install
```

2. Pokreni MySQL bazu i kreiraj bazu `ishrana`.

3. Podesi `.env`.

4. Primeni schema-u na bazu (pre prvog pokretanja):

```bash
npx drizzle-kit push
```

5. Pokreni development server:

```bash
npm run dev
```

6. Otvori:

- App: `http://localhost:3000`
- Swagger: `http://localhost:3000/swagger`

## Pokretanje preko Docker Compose

`docker-compose.yml` podize:

- `db` - MySQL 8 (port `3307` na host-u)
- `app` - Next.js aplikacija (port `3000`)

Pokretanje:

```bash
docker compose up --build
```

Posle prvog podizanja, potrebno je primeniti schema-u na bazu (ako tabele ne postoje):

```bash
docker compose exec app npx drizzle-kit push
```

URL-ovi:

- App: `http://localhost:3000`
- MySQL (host): `localhost:3307`

## Korisni npm skriptovi

- `npm run dev` - development server
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - ESLint

## Napomene za Git push (sta jos treba / preporuka)

Pre push-a proveri sledece:

1. `.env` nije commit-ovan (u ovom projektu je vec ignorisan preko `.gitignore`).
2. Tajne vrednosti (`JWT_SECRET`, DB sifra) nisu upisane u `README.md` ili kod.
3. `node_modules/` i `.next/` nisu u Git-u (vec su ignorisani).
4. `README.md` opisuje kako se projekat pokrece (ovaj fajl).
5. (Preporuka) Dodaj i odrzavaj `.env.example` sa placeholder vrednostima.
6. (Preporuka) Pokreni `npm run lint` i `npm run build` pre push-a.
7. Ako koristis Docker volume (`mysql_data`), on se ne pushuje (compose volume je lokalni).

Primer push komandi:

```bash
git add .
git commit -m "docs: update README and project setup instructions"
git push
```

## Moguca poboljsanja (opciono)

- Dodati `scripts` u `package.json` za Drizzle (`db:push`, `db:generate`, `db:migrate`)
- Dodati seed skriptu za test korisnike (ukljucujuci admin nalog)
- Ukloniti debug `console.log` iz auth ruta pre produkcije
- Dodati testove (API / integration)

## Zahtevi za visu ocenu - status

Status (stanje u repou):

1. `README` sa opisom i pokretanjem aplikacije - uradjeno
2. Najmanje 2 eksterna API-ja - uradjeno
3. CI/CD pipeline (testovi + build + Docker build) - uradjeno (GitHub Actions)
4. Bezbednosne zastite (min 3) - uradjeno
5. Automatizovani testovi - uradjeno (unit testovi za premium plan)
6. Vizualizacija podataka - uradjeno (`/analytics`, Google Charts)
7. Git grane (`develop` + feature grane) - potrebno napraviti/pushovati
8. Cloud deployment - potrebno postaviti na izabranu platformu

Sta je konkretno implementirano:

- Eksterni API #1: `Google Charts` (vizualizacija na `/analytics`)
- Eksterni API #2: `Open-Meteo API` (vremenski podaci na `/analytics`)
- CI pipeline: `.github/workflows/ci.yml`
- Automatizovani testovi: `tests/premiumPlan.test.mjs` (`npm test`)
- Bezbednost (minimum 3):
- CORS restrikcija za `/api/*`
- CSRF mitigacija preko same-origin `Origin` provere za mutirajuce API zahteve
- Security headers / CSP (`Content-Security-Policy`, `X-Frame-Options`, `nosniff`, itd.)

### Git grane (obavezno uradi pre predaje)

Primer komandi:

```bash
git checkout -b develop
git push -u origin develop

git checkout -b feature/analytics
git push -u origin feature/analytics

git checkout -b feature/ci-security
git push -u origin feature/ci-security

git checkout main
```

Ako vec imas lokalne izmene na `main`, mozes prvo commit na feature granu pa onda merge u `develop` i `main`.

### Cloud deployment (sta jos treba)

Najbrze opcije za ovaj projekat (Docker + Next.js + MySQL):

1. `Railway` (app + MySQL servis)
2. `Render` (Web Service + Managed PostgreSQL/MySQL alternativa, ili eksterni DB)
3. `DigitalOcean / VPS` (Docker Compose)

Minimalno za ocenu:

- deploy aplikacije na javni URL
- potvrda da rade `/`, `/login`, `/swagger` i `/analytics`
- upisati produkcioni URL u README


