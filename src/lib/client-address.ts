/**
 * The requesting client's address, for rate limiting. Trusts the first
 * `x-forwarded-for` hop, which is correct behind Vercel, Netlify or any proxy
 * that overwrites the header; a server exposed directly to the internet would let
 * a client choose its own address here.
 */
import "server-only";
import { headers } from "next/headers";

export async function clientAddress(): Promise<string> {
  const incoming = await headers();
  const forwarded = incoming.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || incoming.get("x-real-ip") || "unknown";
}
