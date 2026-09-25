/**
 * Finds and removes the blocks an optional module owns in shared files, and finds
 * any mention of a module outside its own paths and blocks. setup.ts strips with
 * it; modules.check.mts proves the manifest complete with the same code, so the
 * gate tests exactly what setup will do.
 *
 * A block starts at a marker naming its module:
 * - code: a `/** @module name *\/` line, owning the one statement after it,
 *   however many lines that statement spans;
 * - `.env.example`: a `# @module name` line, owning everything to the next blank line;
 * - markdown: `<!-- @module name -->` to `<!-- /@module name -->`.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { ManifestSchema } from "./schemas.ts";
import type { LeakType, ManifestType, RangeType } from "./types.ts";

const CODE_MARKER = /^\s*\/\*\* @module ([\w-]+) \*\/\s*$/;
const ENV_MARKER = /^# @module ([\w-]+)\s*$/;
const MARKDOWN_START = /^<!-- @module ([\w-]+) -->\s*$/;
const MARKDOWN_END = /^<!-- \/@module ([\w-]+) -->\s*$/;
const STATEMENT_END = /[;,]\s*$/;

/** Files whose module mentions must be covered by the manifest. */
const SCANNED_ROOTS = ["src", "next.config.ts", ".env.example", "package.json"];

/** Files a strip rewrites: the scanned code plus the docs that describe modules. */
const STRIPPED_ROOTS = [...SCANNED_ROOTS, "CLAUDE.md", "README.md"];

export function readManifest(root: string): ManifestType {
  return ManifestSchema.parse(
    JSON.parse(readFileSync(join(root, "template.modules.json"), "utf8")),
  );
}

/** The named modules plus every module whose parent is among them. */
export function withChildren(
  manifest: ManifestType,
  names: Iterable<string>,
): Set<string> {
  const selected = new Set(names);
  for (const [name, module] of Object.entries(manifest.modules)) {
    if (module.parent && selected.has(module.parent)) selected.add(name);
  }
  return selected;
}

/** Removes every block owned by any of `modules` from one file's text. */
export function stripSource(
  path: string,
  source: string,
  modules: ReadonlySet<string>,
): string {
  const lines = source.split("\n");
  const doomed = new Set<number>();
  for (const [start, end] of markedRanges(path, lines, modules)) {
    for (let index = start; index <= end; index++) doomed.add(index);
  }
  return lines.filter((_, index) => !doomed.has(index)).join("\n");
}

/** Every line that mentions a module outside that module's own paths and blocks. */
export function findLeaks(
  root: string,
  manifest: ManifestType,
  modules: Iterable<string>,
): LeakType[] {
  const leaks: LeakType[] = [];
  for (const name of modules) {
    const module = manifest.modules[name];
    if (!module) throw new Error(`Unknown module "${name}"`);
    const keywords = module.keywords.map((keyword) => keyword.toLowerCase());
    for (const file of listFiles(root, SCANNED_ROOTS)) {
      if (
        module.paths.some(
          (path) => file === path || file.startsWith(`${path}/`),
        )
      )
        continue;
      const lines = readFileSync(join(root, file), "utf8").split("\n");
      const covered = coveredLines(file, lines, name, [
        ...module.dependencies,
        ...module.scripts,
      ]);
      lines.forEach((text, index) => {
        if (covered.has(index)) return;
        if (keywords.some((keyword) => text.toLowerCase().includes(keyword))) {
          leaks.push({
            file,
            line: index + 1,
            text: text.trim(),
            module: name,
          });
        }
      });
    }
  }
  return leaks;
}

/** Marker names that match no module in the manifest: a typo there would silently survive every strip. */
export function unknownMarkers(root: string, manifest: ManifestType): string[] {
  const known = new Set(Object.keys(manifest.modules));
  const unknown: string[] = [];
  for (const file of listFiles(root, STRIPPED_ROOTS)) {
    readFileSync(join(root, file), "utf8")
      .split("\n")
      .forEach((line, index) => {
        const name = markerName(file, line);
        if (name && !known.has(name))
          unknown.push(`${file}:${index + 1} names "${name}"`);
      });
  }
  return unknown;
}

/** Every file under `roots`, as a path relative to `root`, skipping build output and dependencies. */
export function listFiles(
  root: string,
  roots: readonly string[] = STRIPPED_ROOTS,
): string[] {
  const files: string[] = [];
  const walk = (path: string): void => {
    if (!existsSync(path)) return;
    if (statSync(path).isFile()) {
      files.push(relative(root, path));
      return;
    }
    for (const entry of readdirSync(path)) walk(join(path, entry));
  };
  for (const start of roots) walk(join(root, start));
  return files;
}

function coveredLines(
  file: string,
  lines: readonly string[],
  name: string,
  owned: readonly string[],
): Set<number> {
  const covered = new Set<number>();
  for (const [start, end] of markedRanges(file, lines, new Set([name]))) {
    for (let index = start; index <= end; index++) covered.add(index);
  }
  if (file === "package.json") {
    lines.forEach((line, index) => {
      if (owned.some((key) => line.trimStart().startsWith(`"${key}"`)))
        covered.add(index);
    });
  }
  return covered;
}

function markedRanges(
  path: string,
  lines: readonly string[],
  modules: ReadonlySet<string>,
): RangeType[] {
  if (path.endsWith(".md")) return markdownRanges(lines, modules);
  if (path.endsWith(".env.example")) return envRanges(lines, modules);
  return codeRanges(lines, modules);
}

function markerName(path: string, line: string): string | undefined {
  if (path.endsWith(".md")) return MARKDOWN_START.exec(line)?.[1];
  if (path.endsWith(".env.example")) return ENV_MARKER.exec(line)?.[1];
  return CODE_MARKER.exec(line)?.[1];
}

/** The marker line plus the statement after it, ended where its brackets balance on a `;` or `,`. */
function codeRanges(
  lines: readonly string[],
  modules: ReadonlySet<string>,
): RangeType[] {
  const ranges: RangeType[] = [];
  lines.forEach((line, start) => {
    const name = CODE_MARKER.exec(line)?.[1];
    if (!name || !modules.has(name)) return;
    let depth = 0;
    for (let end = start + 1; end < lines.length; end++) {
      depth += bracketDelta(lines[end] ?? "");
      if (depth < 0)
        throw new Error(
          `@module ${name} marker at line ${start + 1} is not followed by a statement`,
        );
      if (depth === 0 && STATEMENT_END.test(lines[end] ?? "")) {
        ranges.push([start, end]);
        return;
      }
    }
    throw new Error(
      `@module ${name} marker at line ${start + 1} runs to the end of the file`,
    );
  });
  return ranges;
}

/** The marker line to the next blank line, plus the blank line before the marker so spacing stays even. */
function envRanges(
  lines: readonly string[],
  modules: ReadonlySet<string>,
): RangeType[] {
  const ranges: RangeType[] = [];
  lines.forEach((line, start) => {
    const name = ENV_MARKER.exec(line)?.[1];
    if (!name || !modules.has(name)) return;
    let end = start;
    while (end + 1 < lines.length && (lines[end + 1] ?? "").trim() !== "")
      end++;
    const from =
      start > 0 && (lines[start - 1] ?? "").trim() === "" ? start - 1 : start;
    ranges.push([from, end]);
  });
  return ranges;
}

function markdownRanges(
  lines: readonly string[],
  modules: ReadonlySet<string>,
): RangeType[] {
  const ranges: RangeType[] = [];
  lines.forEach((line, start) => {
    const name = MARKDOWN_START.exec(line)?.[1];
    if (!name || !modules.has(name)) return;
    const end = lines.findIndex(
      (candidate, index) =>
        index > start && MARKDOWN_END.exec(candidate)?.[1] === name,
    );
    if (end === -1)
      throw new Error(
        `<!-- @module ${name} --> at line ${start + 1} has no closing marker`,
      );
    ranges.push([start, end]);
  });
  return ranges;
}

function bracketDelta(line: string): number {
  let delta = 0;
  for (const character of line) {
    if (character === "(" || character === "[" || character === "{") delta++;
    if (character === ")" || character === "]" || character === "}") delta--;
  }
  return delta;
}
