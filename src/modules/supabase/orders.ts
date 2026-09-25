/**
 * Sales in the orders table: written by the payment webhook through the admin
 * client, read back by buyers through their own session, where RLS limits each
 * buyer to the orders placed under their email.
 */
import "server-only";
import type { SaleRecordType } from "@/types/capabilities";
import { createAdminSupabase } from "./admin";
import { OrderRowSchema } from "./schemas";
import { createSupabase } from "./server";
import type { OrderType } from "./types";

/** Idempotent on the payment id, so a redelivered webhook never records a sale twice. */
export async function recordSale(sale: SaleRecordType): Promise<boolean> {
  const supabase = createAdminSupabase();
  if (!supabase) return false;
  const { error } = await supabase.from("orders").upsert(
    {
      payment_id: sale.paymentId,
      order_id: sale.orderId,
      pass_id: sale.passId,
      pass_name: sale.passName,
      amount: sale.amount,
      buyer_name: sale.buyerName,
      buyer_email: sale.buyerEmail.toLowerCase(),
      buyer_phone: sale.buyerPhone,
    },
    { onConflict: "payment_id", ignoreDuplicates: true },
  );
  if (error)
    throw new Error(
      `Recording sale ${sale.paymentId} failed: ${error.message}`,
    );
  return true;
}

/** The signed-in buyer's passes, newest first. Row level security does the filtering. */
export async function myOrders(): Promise<OrderType[]> {
  const supabase = await createSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("orders")
    .select("payment_id, pass_name, amount, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Reading orders failed: ${error.message}`);
  return OrderRowSchema.array().parse(data ?? []);
}
