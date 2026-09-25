/**
 * The environment, parsed once at module load. A missing or malformed required
 * variable stops the build with its name and this file's path, rather than
 * failing the first request that needs it. Each module contributes its own
 * variables through one marked spread; its secrets are optional, and the module
 * says so in visible copy when they are unset.
 */
import "server-only";
import { z } from "zod";
/** @module email */
import { EMAIL_ENV } from "@/modules/email/env";
/** @module razorpay */
import { RAZORPAY_ENV } from "@/modules/razorpay/env";
/** @module supabase */
import { SUPABASE_ENV } from "@/modules/supabase/env";

const EnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  /** @module email */
  ...EMAIL_ENV,
  /** @module razorpay */
  ...RAZORPAY_ENV,
  /** @module supabase */
  ...SUPABASE_ENV,
});

export const ENV = parseEnv();

function parseEnv(): z.infer<typeof EnvSchema> {
  const result = EnvSchema.safeParse(process.env);
  if (result.success) return result.data;
  const names = result.error.issues
    .map((issue) => issue.path.join("."))
    .join(", ");
  throw new Error(
    `Missing or invalid environment variable ${names}. Set it in .env.local; the schema is src/lib/env.ts.`,
  );
}
