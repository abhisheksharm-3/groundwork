/**
 * Where a sign-in form may send the browser. With JavaScript off, the Google
 * button is a real form post that the server answers with a redirect to Supabase
 * and then to Google, and `form-action` is enforced on each hop.
 */
import type { CspSourcesType } from "../../types/security.ts";

const PROJECT = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const SUPABASE_CSP: CspSourcesType = {
  "form-action": [
    ...(PROJECT ? [new URL(PROJECT).origin] : []),
    "https://accounts.google.com",
  ],
};
