/**
 * One-time project setup: asks which optional modules this project keeps, removes
 * the rest from every file they touch, then checks the result and starts a fresh
 * git history. Runs with plain `node setup.ts` through Node's type stripping.
 * Answers can be piped on stdin, one per line, in the order the questions appear.
 *
 * On a failed check it stops with the tree as it is and names what broke, so the
 * leaked seam is visible; nothing is rolled back and the history is untouched.
 */
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join } from "node:path";
import { createInterface } from "node:readline/promises";
import {
  findLeaks,
  listFiles,
  readManifest,
  stripSource,
  withChildren,
} from "./scripts/modules.ts";
import { PackageSchema } from "./scripts/schemas.ts";
import type { ManifestType, RunOptionsType } from "./scripts/types.ts";

const ROOT = import.meta.dirname;
const manifest = readManifest(ROOT);
/**
 * Piped answers are read in full up front. readline drops lines that arrive
 * before its first question is asked, and a piped stdin delivers them all at
 * once, so the later questions would wait forever.
 */
const PIPED_ANSWERS = process.stdin.isTTY
  ? null
  : readFileSync(0, "utf8").split("\n");
const prompt = PIPED_ANSWERS
  ? null
  : createInterface({ input: process.stdin, output: process.stdout });
const say = (line: string): boolean => process.stdout.write(`${line}\n`);

const name = await ask("Project name (used for package.json)", basename(ROOT));
const kept = await chooseModules(manifest);
const dropped = withChildren(
  manifest,
  Object.keys(manifest.modules).filter((module) => !kept.has(module)),
);
say(`\nKeeping: ${[...kept].join(", ") || "no optional modules"}`);
say(`Removing: ${[...dropped].join(", ")}`);
say(
  "\nThis rewrites the working tree and replaces the git history with one new commit.",
);
const confirmation = await ask(
  `Type the project name (${name}) to go ahead`,
  "",
);
prompt?.close();
if (confirmation !== name) exit("Stopped before changing anything.");

strip(dropped);
rewritePackage(name, dropped);
run("npx", ["biome", "check", "--write"], { isQuiet: true });

const leaks = findLeaks(
  ROOT,
  manifest,
  [...dropped].filter((module) => module !== "template"),
);
if (leaks.length > 0) {
  for (const leak of leaks)
    console.error(
      `  ${leak.file}:${leak.line} still mentions ${leak.module}: ${leak.text}`,
    );
  exit(
    "A removed module is still referenced. The tree is left as it is so the seam can be fixed.",
  );
}
removeTemplateTooling();

if (!run("npm", ["install"]) || !run("npm", ["run", "check"])) {
  exit(
    "The stripped project does not pass its checks. The tree is left as it is so the failure can be read.",
  );
}
freshHistory(name);
say(
  `\n${name} is ready. Next: cp .env.example .env.local, then run /brand with the client's brief.`,
);

async function ask(question: string, fallback: string): Promise<string> {
  const label = `${question}${fallback ? ` [${fallback}]` : ""}: `;
  if (!prompt) {
    const answer = (PIPED_ANSWERS?.shift() ?? "").trim();
    say(`${label}${answer}`);
    return answer || fallback;
  }
  return (await prompt.question(label)).trim() || fallback;
}

/** Top-level modules are offered one by one; a kept module with transports then picks exactly one. */
async function chooseModules(modules: ManifestType): Promise<Set<string>> {
  const keep = new Set<string>();
  const entries = Object.entries(modules.modules);
  for (const [module, spec] of entries) {
    if (spec.parent || spec.alwaysDrop) continue;
    if (
      (await ask(`Keep ${spec.label}? (y/n)`, "y"))
        .toLowerCase()
        .startsWith("y")
    )
      keep.add(module);
  }
  for (const parent of [...keep]) {
    const children = entries
      .filter(([, spec]) => spec.parent === parent)
      .map(([module]) => module);
    if (children.length === 0) continue;
    const labels = children
      .map((child) => child.replace(`${parent}-`, ""))
      .join(" / ");
    const choice = await ask(
      `Which ${parent} option? (${labels})`,
      children[0]?.replace(`${parent}-`, "") ?? "",
    );
    const picked = children.find((child) => child === `${parent}-${choice}`);
    if (!picked) exit(`"${choice}" is not one of ${labels}.`);
    keep.add(picked);
  }
  return keep;
}

function strip(modules: ReadonlySet<string>): void {
  for (const module of modules) {
    for (const path of manifest.modules[module]?.paths ?? []) {
      if (module !== "template") removeWithEmptyParents(path);
    }
  }
  for (const file of listFiles(ROOT)) {
    const path = join(ROOT, file);
    const before = readFileSync(path, "utf8");
    const after = stripSource(file, before, modules);
    if (after !== before) writeFileSync(path, after);
  }
}

/**
 * Deletes a path, then any parent directory the deletion left empty, stopping at
 * the project root. A parent already gone, because an enclosing module was
 * removed first, is skipped.
 */
function removeWithEmptyParents(path: string): void {
  rmSync(join(ROOT, path), { recursive: true, force: true });
  for (let parent = dirname(path); parent !== "."; parent = dirname(parent)) {
    if (!existsSync(join(ROOT, parent))) continue;
    if (readdirSync(join(ROOT, parent)).length > 0) return;
    rmSync(join(ROOT, parent), { recursive: true });
  }
}

function rewritePackage(
  projectName: string,
  modules: ReadonlySet<string>,
): void {
  const path = join(ROOT, "package.json");
  const pkg = PackageSchema.parse(JSON.parse(readFileSync(path, "utf8")));
  pkg.name = projectName;
  for (const module of modules) {
    const spec = manifest.modules[module];
    for (const dependency of spec?.dependencies ?? []) {
      delete pkg.dependencies[dependency];
      delete pkg.devDependencies[dependency];
    }
    for (const script of spec?.scripts ?? []) delete pkg.scripts[script];
  }
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
}

/** Last, after the leak scan has used the manifest: the template module's own files. */
function removeTemplateTooling(): void {
  for (const path of manifest.modules.template?.paths ?? [])
    rmSync(join(ROOT, path), { recursive: true, force: true });
}

function freshHistory(projectName: string): void {
  rmSync(join(ROOT, ".git"), { recursive: true, force: true });
  execFileSync("git", ["init", "--quiet", "--initial-branch=main"], {
    cwd: ROOT,
  });
  execFileSync("git", ["add", "--all"], { cwd: ROOT });
  execFileSync(
    "git",
    [
      "commit",
      "--quiet",
      "--message",
      `Start ${projectName} from the groundwork template`,
    ],
    { cwd: ROOT },
  );
}

function run(
  command: string,
  args: readonly string[],
  options: RunOptionsType = {},
): boolean {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: options.isQuiet ? "ignore" : "inherit",
  });
  return result.status === 0;
}

function exit(message: string): never {
  console.error(`\n${message}`);
  process.exit(1);
}
