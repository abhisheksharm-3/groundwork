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

/** A confirmed sale, as the payment module hands it to storage. `amount` is whole rupees, from the captured payment. */
export type SaleRecordType = {
  paymentId: string;
  orderId: string;
  passId: string;
  passName: string;
  amount: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
};

export type CapabilitiesType = {
  /** Resolves true when a transport accepted the mail, false when none is configured. Throws on a transport failure. */
  sendMail?: (mail: MailType) => Promise<boolean>;
  /** Resolves true when the message was stored, false when storage is not configured. Throws on a storage failure. */
  saveContactMessage?: (message: ContactMessageType) => Promise<boolean>;
  /** Stores a confirmed sale once; a repeat of the same payment is ignored. False when storage is not configured. Throws on a storage failure. */
  recordSale?: (sale: SaleRecordType) => Promise<boolean>;
  /** Raises an alert for a failure someone should look at. Never throws. */
  reportProblem?: (message: string, error?: unknown) => void;
};
