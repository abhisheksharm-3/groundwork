/**
 * The site's two faces, exposed as the role variables tokens.css reads. A new
 * typeface is a change to this file alone. next/font self-hosts both at build,
 * so the CSP needs no font host.
 */
import { Anek_Latin, Rozha_One } from "next/font/google";

const display = Rozha_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--face-display",
  display: "swap",
});

const body = Anek_Latin({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--face-body",
  display: "swap",
});

/** Put on `<html>`: it defines the variables tokens.css reads. */
export const FONT_VARIABLES = `${display.variable} ${body.variable}`;
