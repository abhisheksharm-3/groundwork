/**
 * What an optional module can plug into the core. Every capability is optional,
 * because any module may be stripped; the core checks for each one and falls
 * back when it is missing. The implementations are wired in src/modules/registry.ts.
 */

export type MailType = {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
};

export type ContactMessageType = {
  name: string;
  email: string;
  message: string;
};

export type CapabilitiesType = {
  /** Resolves true when a transport accepted the mail, false when none is configured. Throws on a transport failure. */
  sendMail?: (mail: MailType) => Promise<boolean>;
  /** Stores a contact message. Throws on a storage failure. */
  saveContactMessage?: (message: ContactMessageType) => Promise<void>;
};
