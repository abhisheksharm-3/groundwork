/** The shape every mail transport implements. */
import type { MailType } from "@/types/capabilities";

/** Sends one mail. Throws with a message naming the setting to check when the provider refuses it. */
export type TransportType = (
  mail: MailType & { from: string },
) => Promise<void>;
