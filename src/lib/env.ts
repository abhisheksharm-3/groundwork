/**
 * The environment, parsed once at module load. A missing or malformed required
 * variable stops the build with its name and this file's path, rather than
 * failing the first request that needs it. Each module contributes its own
 * variables through one marked spread; its secrets are optional, and the module
 * says so in visible copy when they are unset.
 */
import "server-only";
import { z } from "zod";

const EnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
});

export type EnvType = z.infer<typeof EnvSchema>;

export const ENV: EnvType = parseEnv();

function parseEnv(): EnvType {
  const result = EnvSchema.safeParse(process.env);
  if (result.success) return result.data;
  const names = result.error.issues
    .map((issue) => issue.path.join("."))
    .join(", ");
  throw new Error(
    `Missing or invalid environment variable ${names}. Set it in .env.local; the schema is src/lib/env.ts.`,
  );
}
