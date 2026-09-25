/**
 * `.env.example` and the environment schemas must name exactly the same
 * variables. A block left behind when a module is stripped, or a variable a new
 * module reads but never documents, fails here rather than on the first deploy.
 * Reads the files as text: env.ts imports `server-only`, which throws outside
 * Next's server runtime.
 */
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..", "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

const documented = new Set(
  [...read(".env.example").matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map(
    (match) => match[1],
  ),
);

const modulesDir = join(root, "src", "modules");
const moduleSchemas = readdirSync(modulesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join("src", "modules", entry.name, "env.ts"))
  .filter((path) => existsSync(join(root, path)));

const declared = new Set(
  ["src/lib/env.ts", ...moduleSchemas].flatMap((path) =>
    [...read(path).matchAll(/^\s+([A-Z][A-Z0-9_]*):/gm)].map(
      (match) => match[1],
    ),
  ),
);

const undocumented = [...declared].filter((name) => !documented.has(name));
const unread = [...documented].filter((name) => !declared.has(name));

assert.deepEqual(
  undocumented,
  [],
  `declared in a schema but missing from .env.example: ${undocumented.join(", ")}`,
);
assert.deepEqual(
  unread,
  [],
  `in .env.example but read by no schema: ${unread.join(", ")}`,
);
