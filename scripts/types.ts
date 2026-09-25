/** The module manifest, and what a strip or a scan reports back. */
import type { z } from "zod";
import type { ManifestSchema, ModuleSchema } from "./schemas.ts";

export type ModuleType = z.infer<typeof ModuleSchema>;

export type ManifestType = z.infer<typeof ManifestSchema>;

/** A line mentioning a module outside its own paths and marked blocks. */
export type LeakType = {
  file: string;
  line: number;
  text: string;
  module: string;
};

/** Zero-based, inclusive line indexes of one marked block. */
export type RangeType = readonly [start: number, end: number];

export type RunOptionsType = { isQuiet?: boolean };
