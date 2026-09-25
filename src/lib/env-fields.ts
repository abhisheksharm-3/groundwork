/**
 * Field types shared by the core and module environment schemas. Kept apart from
 * env.ts so a module can declare its variables without importing the file that
 * imports it.
 */
import { z } from "zod";

/**
 * An optional secret. An empty value in `.env.local` means unset, because a blank
 * line copied from `.env.example` arrives as the empty string, not as missing.
 */
export const OPTIONAL_TEXT = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);
