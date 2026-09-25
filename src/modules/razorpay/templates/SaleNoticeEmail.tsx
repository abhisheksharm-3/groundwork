/** The organisers' notice of a sale, laid out to be searched and reconciled against the Razorpay dashboard. */
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { formatPrice } from "@/lib/format";
import type { SaleEmailPropsType } from "../types";

export function SaleNoticeEmail({ sale }: SaleEmailPropsType): ReactNode {
  const rows: readonly [string, string][] = [
    ["Pass", sale.passName],
    ["Paid", formatPrice(sale.amount)],
    ["Name", sale.buyer.name],
    ["Email", sale.buyer.email],
    ["Phone", sale.buyer.phone],
    ["Payment", sale.paymentId],
    ["Order", sale.orderId],
  ];
  return (
    <Html lang="en">
      <Head />
      <Preview>
        {sale.passName} sold to {sale.buyer.name}
      </Preview>
      <Body style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: 560, padding: 24 }}>
          {rows.map(([label, value]) => (
            <Text key={label} style={{ fontSize: 14, margin: "0 0 6px" }}>
              <strong>{label}:</strong> {value}
            </Text>
          ))}
        </Container>
      </Body>
    </Html>
  );
}
