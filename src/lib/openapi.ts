export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "MyDietApp API",
    version: "1.0.0",
    description:
      "API specifikacija za aplikaciju za pracenje ishrane, aktivnosti i premium plana.",
  },
  servers: [
    { url: "http://localhost:3000", description: "Local / Docker app" },
  ],
  tags: [
    { name: "Auth" },
    { name: "Profile" },
    { name: "Hrana" },
    { name: "Aktivnost" },
    { name: "Konzumirana hrana" },
    { name: "Odradjene aktivnosti" },
    { name: "Water" },
    { name: "Admin" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "sifra"],
        properties: {
          email: { type: "string", example: "luka@gmail.com" },
          sifra: { type: "string", example: "123456" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["ime", "email", "sifra"],
        properties: {
          ime: { type: "string", example: "Luka" },
          email: { type: "string", example: "luka@gmail.com" },
          sifra: { type: "string", example: "123456" },
          uloga: {
            type: "string",
            enum: ["OBICAN", "PREMIUM", "ADMIN"],
            example: "PREMIUM",
          },
          tezina: { type: "number", example: 78.5, nullable: true },
          visina: { type: "number", example: 182, nullable: true },
          ciljnaTezina: { type: "number", example: 75, nullable: true },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string" },
              ime: { type: "string" },
              uloga: { type: "string" },
            },
          },
        },
      },
      PremiumPlan: {
        type: "object",
        properties: {
          maintenanceKcal: { type: "number" },
          targetKcal: { type: "number" },
          proteinG: { type: "number" },
          mastiG: { type: "number" },
          ugljeniHidratiG: { type: "number" },
          vodaMl: { type: "number" },
          bmi: { type: "number", nullable: true },
          razlikaDoCiljaKg: { type: "number" },
          smer: {
            type: "string",
            enum: ["SMANJENJE", "POVECANJE", "ODRZAVANJE"],
          },
          procenaNedeljnogPomerajaKg: { type: "number" },
          napomena: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registracija korisnika",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Uspesna registracija",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { message: { type: "string" } },
                },
              },
            },
          },
          "400": {
            description: "Validaciona greska",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login korisnika",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Uspesan login",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "401": {
            description: "Pogresan email ili lozinka",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/profile": {
      get: {
        tags: ["Profile"],
        summary: "Vraca profil ulogovanog korisnika i premium plan",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Profil korisnika",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        ime: { type: "string", nullable: true },
                        email: { type: "string", nullable: true },
                        uloga: { type: "string", nullable: true },
                        tezina: { type: "number", nullable: true },
                        visina: { type: "number", nullable: true },
                        ciljnaTezina: { type: "number", nullable: true },
                      },
                    },
                    premiumPlan: {
                      anyOf: [
                        { $ref: "#/components/schemas/PremiumPlan" },
                        { type: "null" },
                      ],
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Niste ulogovani",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Profile"],
        summary:
          "Azurira tezinu premium korisnika ili upgrade-uje nalog na premium",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  {
                    type: "object",
                    required: ["tezina"],
                    properties: {
                      tezina: { type: "number", example: 77.4 },
                    },
                  },
                  {
                    type: "object",
                    required: ["action", "tezina", "visina", "ciljnaTezina"],
                    properties: {
                      action: {
                        type: "string",
                        enum: ["upgradePremium"],
                        example: "upgradePremium",
                      },
                      tezina: { type: "number", example: 80 },
                      visina: { type: "number", example: 182 },
                      ciljnaTezina: { type: "number", example: 75 },
                    },
                  },
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Uspeh",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { message: { type: "string" } },
                },
              },
            },
          },
          "400": {
            description: "Neispravan unos",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Premium-only operacija",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/hrana": {
      get: {
        tags: ["Hrana"],
        summary: "Lista prihvacenih namirnica",
        responses: {
          "200": {
            description: "Lista hrane",
          },
        },
      },
      post: {
        tags: ["Hrana"],
        summary: "Predlog nove hrane (na odobrenje)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "nazivHrane",
                  "kalorije",
                  "proteini",
                  "masti",
                  "ugljeniHidrati",
                ],
                properties: {
                  nazivHrane: { type: "string" },
                  kalorije: { type: "number" },
                  proteini: { type: "number" },
                  masti: { type: "number" },
                  ugljeniHidrati: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Predlog sacuvan" },
          "401": { description: "Niste ulogovani" },
        },
      },
    },
    "/api/aktivnost": {
      get: {
        tags: ["Aktivnost"],
        summary: "Lista prihvacenih aktivnosti",
        responses: { "200": { description: "Lista aktivnosti" } },
      },
      post: {
        tags: ["Aktivnost"],
        summary: "Predlog nove aktivnosti (na odobrenje)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nazivAktivnosti", "prosekKalorija"],
                properties: {
                  nazivAktivnosti: { type: "string" },
                  prosekKalorija: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Predlog sacuvan" },
          "401": { description: "Niste ulogovani" },
        },
      },
    },
    "/api/konzumirana-hrana": {
      get: {
        tags: ["Konzumirana hrana"],
        summary: "Dnevni unosi hrane i total makroa/kalorija",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "datum",
            required: true,
            schema: { type: "string", example: "2026-02-24" },
          },
        ],
        responses: { "200": { description: "Dnevni pregled" } },
      },
      post: {
        tags: ["Konzumirana hrana"],
        summary: "Dodaje unos hrane korisniku za datum",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["hranaId", "datum", "kolicina"],
                properties: {
                  hranaId: { type: "string", example: "1" },
                  datum: { type: "string", example: "2026-02-24" },
                  kolicina: { type: "number", example: 150 },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Unos sacuvan" } },
      },
    },
    "/api/odradjene-aktivnosti": {
      get: {
        tags: ["Odradjene aktivnosti"],
        summary: "Dnevni unosi aktivnosti i total potrosenih kalorija",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "datum",
            required: true,
            schema: { type: "string", example: "2026-02-24" },
          },
        ],
        responses: { "200": { description: "Dnevni pregled aktivnosti" } },
      },
      post: {
        tags: ["Odradjene aktivnosti"],
        summary: "Dodaje odradjenu aktivnost za korisnika",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["aktivnostId", "datum", "trajanjeMin"],
                properties: {
                  aktivnostId: { type: "string", example: "1" },
                  datum: { type: "string", example: "2026-02-24" },
                  trajanjeMin: { type: "number", example: 45 },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Aktivnost sacuvana" } },
      },
    },
    "/api/water": {
      get: {
        tags: ["Water"],
        summary: "Vraca unos vode za datum",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "datum",
            required: true,
            schema: { type: "string", example: "2026-02-24" },
          },
        ],
        responses: { "200": { description: "Unos vode" } },
      },
      post: {
        tags: ["Water"],
        summary: "Snima/azurira unos vode za datum",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["datum", "kolicinaMl"],
                properties: {
                  datum: { type: "string", example: "2026-02-24" },
                  kolicinaMl: { type: "number", example: 1800 },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Unos vode sacuvan" } },
      },
    },
    "/api/admin/moderation": {
      get: {
        tags: ["Admin"],
        summary: "Lista pending hrane i aktivnosti za admin moderaciju",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Pending entiteti" } },
      },
      patch: {
        tags: ["Admin"],
        summary: "Accept/reject hrane ili aktivnosti",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["entity", "action", "id"],
                properties: {
                  entity: {
                    type: "string",
                    enum: ["hrana", "aktivnost"],
                    example: "hrana",
                  },
                  action: {
                    type: "string",
                    enum: ["accept", "reject"],
                    example: "accept",
                  },
                  id: { type: "string", example: "1" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Status azuriran" },
          "401": { description: "Niste ulogovani" },
          "403": { description: "Samo admin ima pristup" },
        },
      },
    },
  },
} as const;

