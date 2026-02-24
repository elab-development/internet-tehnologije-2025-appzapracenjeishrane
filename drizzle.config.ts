import type { Config } from "drizzle-kit";

function dbCredentialsFromUrl(databaseUrl?: string) {
  if (!databaseUrl) return null;

  try {
    const url = new URL(databaseUrl);
    return {
      host: url.hostname,
      port: Number(url.port || "3306"),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
    };
  } catch {
    return null;
  }
}

const parsedUrl = dbCredentialsFromUrl(process.env.DATABASE_URL);

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST ?? parsedUrl?.host ?? "localhost",
    port: Number(process.env.DB_PORT ?? parsedUrl?.port ?? "3306"),
    user: process.env.DB_USER ?? parsedUrl?.user ?? "root",
    password: process.env.DB_PASSWORD ?? parsedUrl?.password ?? "",
    database: process.env.DB_NAME ?? parsedUrl?.database ?? "ishrana",
  },
} satisfies Config;
