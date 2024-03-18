import { loadEnv } from "./env.ts";
import { Kysely, PostgresDialect } from "npm:kysely";
// @deno-types="npm:@types/pg"
import { Pool } from "npm:pg";
import { DB } from "./database-types.ts";

await loadEnv();

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
  }),
});

export const db = new Kysely<DB>({
  dialect,
});
