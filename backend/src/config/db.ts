import { Pool } from "pg";
import { env } from "./env.js";

export const db = new Pool({
  connectionString: env.DB_URL,
});

export async function initDb() {
  await db.query("SELECT 1;");
}
