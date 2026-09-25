/** The manifest's shape, parsed so a malformed template.modules.json stops setup before it deletes anything. */
import { z } from "zod";

export const ModuleSchema = z.object({
  label: z.string().min(1),
  parent: z.string().min(1).optional(),
  /** Dropped by every setup run, never offered as a choice: the template's own tooling. */
  alwaysDrop: z.boolean().optional(),
  paths: z.array(z.string().min(1)),
  dependencies: z.array(z.string().min(1)),
  /** package.json scripts the module owns. */
  scripts: z.array(z.string().min(1)),
  keywords: z.array(z.string().min(1)).min(1),
});

export const ManifestSchema = z.object({
  modules: z.record(z.string(), ModuleSchema),
});

/** The parts of package.json setup edits; every other field passes through untouched. */
export const PackageSchema = z.looseObject({
  name: z.string(),
  scripts: z.record(z.string(), z.string()).default({}),
  dependencies: z.record(z.string(), z.string()).default({}),
  devDependencies: z.record(z.string(), z.string()).default({}),
});
