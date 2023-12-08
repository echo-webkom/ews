import { loadEnv } from "./env.ts";
import postgres from "https://deno.land/x/postgresjs@v3.4.3/mod.js";

await loadEnv();

const sql = postgres(Deno.env.get("DATABASE_URL")!);

export default sql;
