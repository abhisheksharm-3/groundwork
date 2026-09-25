/**
 * Turns a captured payment into the buyer's receipt and the organisers' notice,
 * exactly once. Only the webhook calls it: the browser can close between paying
 * and returning, but Razorpay's webhook delivers at least once.
 *
 * ponytail: the idempotency stamp is a read-then-write on the payment's notes,
 * not a lock, so two truly simultaneous deliveries of one event can both send
 * mail. Handling only `payment.captured` keeps that window to redeliveries; a
 * unique constraint in a database closes it if duplicates ever matter.
 */
import "server-only";
import { deliverMail } from "@/lib/deliver-mail";
import { findPass } from "@/lib/pricing";
import { CAPABILITIES } from "@/modules/registry";
import { fetchOrder, fetchPayment, markPaymentConfirmed } from "./client";
import { CAPTURED, CONFIRMED_NOTE } from "./constants";
import { saleMails } from "./mails";
import type {
  ConfirmOutcomeType,
  RazorpayOrderType,
  RazorpayPaymentType,
  SaleType,
} from "./types";

export async function confirmPayment(
  paymentId: string,
): Promise<ConfirmOutcomeType> {
  const payment = await read(
    () => fetchPayment(paymentId),
    `payment ${paymentId}`,
  );
  if (!payment) return { isConfirmed: false, reason: "payment-unreadable" };
  if (payment.notes[CONFIRMED_NOTE])
    return { isConfirmed: false, reason: "already-confirmed" };
  if (payment.status !== CAPTURED) {
    console.error(
      `[razorpay] payment ${paymentId} is "${payment.status}", not "${CAPTURED}". Check Settings -> Payment capture is Automatic.`,
    );
    return { isConfirmed: false, reason: "not-captured" };
  }

  const order = await read(
    () => fetchOrder(payment.order_id),
    `order ${payment.order_id}`,
  );
  if (!order) return { isConfirmed: false, reason: "order-unreadable" };

  const sale = toSale(payment, order);
  if (!(await record(sale)))
    return { isConfirmed: false, reason: "record-failed" };
  const { receipt, notice } = await saleMails(sale);
  const [toBuyer, toOrganisers] = await Promise.allSettled([
    deliverMail(receipt),
    deliverMail(notice),
  ]);
  if (toBuyer.status === "rejected" && toOrganisers.status === "rejected") {
    console.error(
      `[razorpay] no mail delivered for ${paymentId}; left unconfirmed so Razorpay retries`,
      toBuyer.reason,
    );
    return { isConfirmed: false, reason: "mail-failed" };
  }
  for (const result of [toBuyer, toOrganisers]) {
    if (result.status === "rejected")
      console.error(
        `[razorpay] one confirmation mail failed for ${paymentId}`,
        result.reason,
      );
  }

  await markPaymentConfirmed(paymentId).catch((error: unknown) => {
    console.error(
      `[razorpay] mails sent but ${paymentId} not stamped; a retry may duplicate them`,
      error,
    );
  });
  return { isConfirmed: true };
}

/**
 * Hands the sale to storage before any mail goes out. Storage ignores a repeat of
 * the same payment, so when it fails the webhook can ask Razorpay to redeliver
 * with nothing sent yet. True when stored or when no storage module is present.
 */
async function record(sale: SaleType): Promise<boolean> {
  try {
    await CAPABILITIES.recordSale?.({
      paymentId: sale.paymentId,
      orderId: sale.orderId,
      passId: sale.passId,
      passName: sale.passName,
      amount: sale.amount,
      buyerName: sale.buyer.name,
      buyerEmail: sale.buyer.email,
      buyerPhone: sale.buyer.phone,
    });
    return true;
  } catch (error) {
    console.error(
      `[razorpay] could not record ${sale.paymentId}; Razorpay will redeliver`,
      error,
    );
    return false;
  }
}

async function read<T>(
  load: () => Promise<T>,
  what: string,
): Promise<T | null> {
  try {
    return await load();
  } catch (error) {
    console.error(
      `[razorpay] CONFIRM FAILED, ${what} unreadable. The Razorpay dashboard is the only record.`,
      error,
    );
    return null;
  }
}

/** The amount comes from the payment, the authority on what was taken; everything else from the order's server-written notes. */
function toSale(
  payment: RazorpayPaymentType,
  order: RazorpayOrderType,
): SaleType {
  const { notes } = order;
  return {
    buyer: {
      name: notes.name ?? "Guest",
      email: notes.email ?? "",
      phone: notes.phone ?? "",
    },
    passId: notes.pass ?? "",
    passName: findPass(notes.pass ?? "")?.name ?? "Pass",
    paymentId: payment.id,
    orderId: order.id,
    amount: payment.amount / 100,
  };
}
