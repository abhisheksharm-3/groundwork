/** The global Razorpay's checkout.js defines once it has loaded. */
import type { RazorpayCheckoutType } from "./types";

declare global {
  interface Window {
    Razorpay?: RazorpayCheckoutType;
  }
}
