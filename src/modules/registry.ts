/**
 * The one place optional modules plug into the core. A module owns a marked
 * import and a marked entry here; both go when the module is removed, and the
 * core falls back for any capability that is missing. Modules never import each
 * other, so removing one can never leave a dangling import.
 */
import type { CapabilitiesType } from "@/types/capabilities";
/** @module email */
import { sendMail } from "./email/send";
/** @module supabase */
import { saveContactMessage } from "./supabase/contact";

export const CAPABILITIES: CapabilitiesType = {
  /** @module email */
  sendMail,
  /** @module supabase */
  saveContactMessage,
};
