/**
 * The manifest is complete and the strip is exact. Every mention of a module
 * outside its own paths must sit inside a block marked for it, or setup would
 * leave that mention behind when the module is dropped; and each block shape
 * the codebase uses must strip to exactly what was around it.
 */
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  findLeaks,
  readManifest,
  stripSource,
  unknownMarkers,
  withChildren,
} from "./modules.ts";

const root = join(import.meta.dirname, "..");
const manifest = readManifest(root);
const names = Object.keys(manifest.modules);

const leaks = findLeaks(root, manifest, names);
assert.deepEqual(
  leaks.map((leak) => `${leak.module}: ${leak.file}:${leak.line} ${leak.text}`),
  [],
  "every module mention is inside its own paths or a block marked for it",
);
assert.deepEqual(
  unknownMarkers(root, manifest),
  [],
  "every marker names a module in the manifest",
);

for (const [name, module] of Object.entries(manifest.modules)) {
  for (const path of module.paths)
    assert.ok(
      existsSync(join(root, path)),
      `${name} lists ${path}, which does not exist`,
    );
  if (module.parent)
    assert.ok(
      manifest.modules[module.parent],
      `${name}'s parent ${module.parent} is in the manifest`,
    );
}

assert.deepEqual(
  [...withChildren(manifest, ["email"])].sort(),
  ["email", "email-resend", "email-smtp"],
  "dropping email drops its transports",
);

const drop = new Set(["pay"]);
const code = [
  'import { keep } from "./keep";',
  "/** @module pay */",
  'import { one } from "./one";',
  "/** @module pay */",
  "import {",
  "  first,",
  "  second,",
  '} from "./two";',
  "const list = [",
  "  keep,",
  "  /** @module pay */",
  "  one(),",
  "];",
  "const shape = {",
  "  /** @module pay */",
  "  ...spread,",
  "  /** @module pay */",
  "  nested: {",
  '    href: "/x/[id]",',
  "  },",
  "  kept: true,",
  "};",
].join("\n");
assert.equal(
  stripSource("file.ts", code, drop),
  [
    'import { keep } from "./keep";',
    "const list = [",
    "  keep,",
    "];",
    "const shape = {",
    "  kept: true,",
    "};",
  ].join("\n"),
  "single-line, multi-line, spread, nested and array blocks all strip exactly",
);
assert.equal(
  stripSource("file.ts", code, new Set(["other"])),
  code,
  "blocks of kept modules are untouched",
);
assert.throws(
  () => stripSource("file.ts", "const a = {\n  /** @module pay */\n};", drop),
  /not followed by a statement/,
);

const env = [
  "# core",
  "A=1",
  "",
  "# @module pay",
  "# what it is",
  "PAY_KEY=",
  "PAY_SECRET=",
  "",
  "# @module other",
  "OTHER=",
].join("\n");
assert.equal(
  stripSource(".env.example", env, drop),
  ["# core", "A=1", "", "# @module other", "OTHER="].join("\n"),
  "an env block strips to the next blank line",
);

const workflow = [
  "jobs:",
  "  gate:",
  "    runs-on: x",
  "",
  "# @module pay",
  "  pay-job:",
  "    runs-on: y",
].join("\n");
assert.equal(
  stripSource(".github/workflows/ci.yml", workflow, drop),
  ["jobs:", "  gate:", "    runs-on: x"].join("\n"),
  "a YAML block strips like an env block",
);

const markdown = [
  "# Title",
  "<!-- @module pay -->",
  "Pay notes.",
  "<!-- /@module pay -->",
  "Kept.",
].join("\n");
assert.equal(
  stripSource("README.md", markdown, drop),
  ["# Title", "Kept."].join("\n"),
  "a markdown block strips between its markers",
);
assert.throws(
  () => stripSource("README.md", "<!-- @module pay -->\nno end", drop),
  /no closing marker/,
);
