/** The signed-in buyer's passes, read through their own session so RLS returns only theirs. */
import type { ReactNode } from "react";
import { formatDayMonth, formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site-config";
import { myOrders } from "../orders";

export async function YourPasses(): Promise<ReactNode> {
  const orders = await myOrders();
  return (
    <section aria-labelledby="passes" className="grid gap-6">
      <h2 id="passes" className="text-2xl">
        Your passes
      </h2>
      {orders.length === 0 ? (
        <p className="text-ink-soft">
          No passes under this email yet. A pass bought with a different address
          will not show here; write to {SITE.contact.email} and we will move it.
        </p>
      ) : (
        <ul className="grid gap-4">
          {orders.map((order) => (
            <li
              key={order.payment_id}
              className="flex flex-wrap items-baseline justify-between gap-4 rounded-lg bg-surface p-6 shadow-lift"
            >
              <span className="font-display text-xl">{order.pass_name}</span>
              <span className="text-ink-soft">
                {formatPrice(order.amount)} · {formatDayMonth(order.created_at)}{" "}
                ·{" "}
                <span className="font-sans font-semibold text-ink">
                  {order.payment_id}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
