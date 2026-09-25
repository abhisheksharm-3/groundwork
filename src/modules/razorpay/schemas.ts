/**
 * The shapes this module accepts: Razorpay's responses, parsed so that a change
 * on Razorpay's side fails loudly instead of flowing through as undefined, and
 * the buyer details the checkout form posts.
 */
import { z } from "zod";

const NotesSchema = z.record(z.string(), z.string()).optional();

export const RazorpayOrderSchema = z.object({
  id: z.string(),
  amount: z.number().int(),
  status: z.string(),
  notes: z
    .union([NotesSchema, z.array(z.never())])
    .transform((notes) => (Array.isArray(notes) ? {} : (notes ?? {}))),
});

export const RazorpayPaymentSchema = z.object({
  id: z.string(),
  status: z.string(),
  order_id: z.string(),
  amount: z.number().int(),
  notes: z
    .union([NotesSchema, z.array(z.never())])
    .transform((notes) => (Array.isArray(notes) ? {} : (notes ?? {}))),
});

export const CheckoutSchema = z.object({
  passId: z.string().min(1).max(40),
  name: z
    .string()
    .trim()
    .min(1, "Tell us the name on the pass.")
    .max(120, "Keep the name under 120 characters."),
  email: z.email("Enter the email address the receipt should go to."),
  phone: z
    .string()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .pipe(
      z
        .string()
        .regex(
          /^(?:\+91)?[6-9]\d{9}$/,
          "Enter a 10-digit Indian mobile number.",
        ),
    ),
});

export const WebhookEventSchema = z.object({
  event: z.string(),
  payload: z
    .object({
      payment: z.object({ entity: z.object({ id: z.string() }) }).optional(),
    })
    .optional(),
});
