/** The buyer's receipt: what they bought, what they paid, and the reference to quote. */
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site-config";
import type { SaleEmailPropsType } from "../types";

const { ground, ink, accent, quiet } = SITE.chrome;

export function ReceiptEmail({ sale }: SaleEmailPropsType): ReactNode {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        Your {sale.passName} for {SITE.name} {SITE.edition} is confirmed.
      </Preview>
      <Body
        style={{
          backgroundColor: ground,
          fontFamily: "Helvetica, Arial, sans-serif",
          margin: 0,
          padding: "32px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: ink,
            borderRadius: 8,
            maxWidth: 560,
            padding: 40,
          }}
        >
          <Text
            style={{
              color: ground,
              fontSize: 12,
              letterSpacing: 2,
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            {SITE.dates.label} · {SITE.venue.city}
          </Text>
          <Heading style={{ color: ground, fontSize: 32, margin: "12px 0 0" }}>
            You are coming to {SITE.name}.
          </Heading>
          <Text style={{ color: ground, fontSize: 16, lineHeight: "24px" }}>
            {sale.buyer.name}, your {sale.passName.toLowerCase()} is confirmed.
            Bring this email or the reference below to the desk at{" "}
            {SITE.venue.name}.
          </Text>
          <Section
            style={{
              backgroundColor: accent,
              borderRadius: 4,
              padding: "16px 20px",
            }}
          >
            <Text style={{ color: ground, fontSize: 14, margin: 0 }}>
              {sale.passName} · {formatPrice(sale.amount)}
            </Text>
            <Text
              style={{
                color: ground,
                fontFamily: "Menlo, monospace",
                fontSize: 14,
                margin: "6px 0 0",
              }}
            >
              Reference {sale.paymentId}
            </Text>
          </Section>
          <Hr style={{ borderColor: quiet, margin: "28px 0" }} />
          <Text
            style={{
              color: ground,
              fontSize: 14,
              lineHeight: "22px",
              margin: 0,
            }}
          >
            {SITE.venue.name}, {SITE.venue.address}
            <br />
            Questions: {SITE.contact.email}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
