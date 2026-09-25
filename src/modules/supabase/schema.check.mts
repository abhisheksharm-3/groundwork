/**
 * Every table in schema.sql has row level security enabled and at least one
 * policy. A table added without either fails here, not in production, where a
 * missing RLS line would leave the table open to anyone with the publishable key.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sql = readFileSync(
  join(import.meta.dirname, "schema.sql"),
  "utf8",
).toLowerCase();
const tables = [...sql.matchAll(/create table ([\w.]+)/g)].map(
  (match) => match[1],
);

assert.ok(tables.length > 0, "schema.sql declares at least one table");
for (const table of tables) {
  assert.ok(
    sql.includes(`alter table ${table} enable row level security`),
    `${table} has row level security enabled`,
  );
  assert.match(
    sql,
    new RegExp(`create policy "[^"]+"\\s+on ${table.replace(".", "\\.")}\\s`),
    `${table} has a policy`,
  );
}
