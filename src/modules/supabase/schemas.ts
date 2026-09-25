/** The auth forms' inputs and the profile row, parsed before anything reads them. */
import { z } from "zod";

export const CredentialsSchema = z.object({
  email: z.email("Enter the email address you signed up with."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(72, "Keep it under 72 characters."),
});

export const DisplayNameSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Tell us what to call you.")
    .max(80, "Keep it under 80 characters."),
});

export const ProfileSchema = z.object({
  id: z.uuid(),
  display_name: z.string().nullable(),
});

/**
 * Where a sign-in may land. The dashboard is the only signed-in page, so any
 * other value falls back to it, which makes the callback impossible to use as an
 * open redirect rather than merely hard to.
 */
export const NextPathSchema = z.literal("/dashboard").catch("/dashboard");
