import { loadEnv } from "./env.ts";
import { Kysely, PostgresDialect } from "npm:kysely";
// @deno-types="npm:@types/pg"
import pg from "npm:pg";
import { DB } from "./database-types.ts";

const { Pool } = pg;

await loadEnv();

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
  }),
});

export const db = new Kysely<DB>({
  dialect,
});
