/**
 * Stores a contact message. The table accepts inserts from anyone and has no
 * select policy, so a visitor can write a message but nobody can read one back
 * through the API; the organisers read them in the Supabase dashboard.
 */
import "server-only";
import type { ContactMessageType } from "@/types/capabilities";
import { createSupabase } from "./server";

/** False when Supabase is not configured, so the contact form falls back instead of failing. */
export async function saveContactMessage(
  message: ContactMessageType,
): Promise<boolean> {
  const supabase = await createSupabase();
  if (!supabase) return false;
  const { error } = await supabase.from("contact_messages").insert(message);
  if (error)
    throw new Error(`Saving the contact message failed: ${error.message}`);
  return true;
}
