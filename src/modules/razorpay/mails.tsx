/** Renders a confirmed sale into the buyer's receipt and the organisers' notice. */
import "server-only";
import { render } from "@react-email/components";
import { SITE } from "@/lib/site-config";
import type { MailType } from "@/types/capabilities";
import { ReceiptEmail } from "./templates/ReceiptEmail";
import { SaleNoticeEmail } from "./templates/SaleNoticeEmail";
import type { SaleType } from "./types";

export async function saleMails(
  sale: SaleType,
): Promise<{ receipt: MailType; notice: MailType }> {
  const [receiptHtml, receiptText, noticeHtml, noticeText] = await Promise.all([
    render(<ReceiptEmail sale={sale} />),
    render(<ReceiptEmail sale={sale} />, { plainText: true }),
    render(<SaleNoticeEmail sale={sale} />),
    render(<SaleNoticeEmail sale={sale} />, { plainText: true }),
  ]);
  return {
    receipt: {
      to: sale.buyer.email,
      replyTo: SITE.contact.email,
      subject: `Your ${sale.passName.toLowerCase()} for ${SITE.name} ${SITE.edition}`,
      html: receiptHtml,
      text: receiptText,
    },
    notice: {
      to: SITE.contact.email,
      replyTo: sale.buyer.email,
      subject: `${sale.passName} sold: ${sale.buyer.name}`,
      html: noticeHtml,
      text: noticeText,
    },
  };
}
