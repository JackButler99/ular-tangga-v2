import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL belum tersedia. Tambahkan ke file .env.local.",
    );
  }

  return drizzle(databaseUrl, { schema });
}