/**
 * The hosts Razorpay's Checkout loads from: its script, the iframe the payment
 * sheet renders in, and the endpoints that sheet calls.
 */
import type { CspExemptionType, CspSourcesType } from "../../types/security.ts";

export const RAZORPAY_CSP: CspSourcesType = {
  "script-src": ["https://checkout.razorpay.com", "https://cdn.razorpay.com"],
  "frame-src": ["https://api.razorpay.com", "https://checkout.razorpay.com"],
  "connect-src": [
    "https://api.razorpay.com",
    "https://lumberjack.razorpay.com",
  ],
  "img-src": ["https://cdn.razorpay.com"],
  "trusted-types": ["razorpay-checkout"],
};

/**
 * Razorpay's checkout.js assigns innerHTML to inject its own styles, which
 * Trusted Types blocks, and the payment sheet then never opens (measured in
 * Chrome). So the checkout pages, and only those, run without the Trusted Types
 * requirement; every other directive still applies there.
 */
export const RAZORPAY_CSP_EXEMPTION: CspExemptionType = {
  source: "/checkout/:path*",
  drop: ["require-trusted-types-for"],
  reason: "checkout.js writes innerHTML",
};
