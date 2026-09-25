"use server";

/**
 * Takes a message from the contact form. The limiter runs before the parse so a
 * flood is refused without doing any work, and nothing after the parse reads the
 * raw form again. The message goes to email and to storage when those modules
 * are present; with neither, it is logged, because a form that says "sent" and
 * keeps nothing is the worst failure a contact form has.
 */
import { clientAddress } from "@/lib/client-address";
import { deliverMail } from "@/lib/deliver-mail";
import { firstFieldErrors } from "@/lib/field-errors";
import { createRateLimiter } from "@/lib/rate-limit";
import { SITE } from "@/lib/site-config";
import { CAPABILITIES } from "@/modules/registry";
import type { ContactMessageType } from "@/types/capabilities";
import { ContactSchema } from "./schemas";
import type {
  ContactFieldType,
  ContactStateType,
  ContactValuesType,
} from "./types";

const FIELDS: readonly ContactFieldType[] = ["name", "email", "message"];

const isAllowed = createRateLimiter({ limit: 10, windowMs: 60_000 });

const FAILED = `We could not send your message. Email us at ${SITE.contact.email} instead.`;

export async function sendContactAction(
  _previous: ContactStateType,
  formData: FormData,
): Promise<ContactStateType> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  };
  const values = echoable(raw);

  if (!isAllowed(await clientAddress())) {
    return {
      status: "failed",
      message: "Too many messages from this address. Try again in a minute.",
      values,
    };
  }

  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    if (parsed.error.issues.some((issue) => issue.path[0] === "website"))
      return { status: "sent" };
    return {
      status: "invalid",
      errors: firstFieldErrors(parsed.error.issues, FIELDS),
      values,
    };
  }

  const { name, email, message } = parsed.data;
  const [mail, storage] = await Promise.allSettled([
    deliverMail({
      to: SITE.contact.email,
      replyTo: email,
      subject: `Message from ${name}`,
      text: `${name} <${email}> wrote:\n\n${message}`,
      html: `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt; wrote:</p><p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>`,
    }),
    storeMessage({ name, email, message }),
  ]);

  return outcome(mail, storage, { name, email, message });
}

/**
 * A configured channel that failed is only an error when no other channel kept
 * the message. When no channel is configured at all, the log is the record.
 */
function outcome(
  mail: PromiseSettledResult<boolean>,
  storage: PromiseSettledResult<boolean>,
  message: ContactMessageType,
): ContactStateType {
  for (const result of [mail, storage]) {
    if (result.status === "rejected")
      console.error("[contact] a channel failed:", result.reason);
  }
  const isMailed = mail.status === "fulfilled" && mail.value === true;
  const isStored = storage.status === "fulfilled" && storage.value;
  if (isMailed || isStored) return { status: "sent" };
  if (mail.status === "rejected" || storage.status === "rejected") {
    return { status: "failed", message: FAILED, values: message };
  }
  console.info(
    "[contact] no email or storage module is configured; the message is only in this log:",
    message,
  );
  return { status: "sent" };
}

/** True when a storage module kept the message; false when none is installed or configured. */
async function storeMessage(message: ContactMessageType): Promise<boolean> {
  return (await CAPABILITIES.saveContactMessage?.(message)) ?? false;
}

/** What the visitor typed, echoed back so a failed submit never loses their message. Capped, and only ever re-rendered as text. */
function echoable(
  raw: Record<ContactFieldType, FormDataEntryValue | null>,
): ContactValuesType {
  const text = (value: FormDataEntryValue | null) =>
    typeof value === "string" ? value.slice(0, 4000) : "";
  return {
    name: text(raw.name),
    email: text(raw.email),
    message: text(raw.message),
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
