"use server";

/**
 * Sign in, sign up, Google, sign out, and the one profile edit. Each parses its
 * input first and reaches Supabase only through the cookie-bound server client,
 * so every query runs as the signed-in user and row level security decides what
 * it may touch.
 */
import { redirect } from "next/navigation";
import { clientAddress } from "@/lib/client-address";
import { ENV } from "@/lib/env";
import { firstFieldErrors } from "@/lib/field-errors";
import { createRateLimiter } from "@/lib/rate-limit";
import { SITE } from "@/lib/site-config";
import {
  CredentialsSchema,
  DisplayNameSchema,
  NextPathSchema,
} from "./schemas";
import { createSupabase } from "./server";
import { currentUser } from "./session";
import type { AuthFieldType, AuthStateType } from "./types";

const FIELDS: readonly AuthFieldType[] = ["email", "password", "displayName"];

const isAllowed = createRateLimiter({ limit: 10, windowMs: 60_000 });

const UNAVAILABLE: AuthStateType = {
  status: "failed",
  message: `Accounts are not switched on yet. Write to ${SITE.contact.email} if you need help with a pass.`,
};

const TOO_MANY: AuthStateType = {
  status: "failed",
  message: "Too many attempts from this address. Try again in a minute.",
};

export async function signInAction(
  _previous: AuthStateType,
  formData: FormData,
): Promise<AuthStateType> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  };
  if (!isAllowed(await clientAddress())) return TOO_MANY;
  const parsed = CredentialsSchema.safeParse(raw);
  if (!parsed.success)
    return {
      status: "invalid",
      errors: firstFieldErrors(parsed.error.issues, FIELDS),
    };
  const supabase = await createSupabase();
  if (!supabase) return UNAVAILABLE;

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error)
    return {
      status: "failed",
      message: "That email and password do not match an account.",
    };
  redirect(NextPathSchema.parse(raw.next));
}

export async function signUpAction(
  _previous: AuthStateType,
  formData: FormData,
): Promise<AuthStateType> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };
  if (!isAllowed(await clientAddress())) return TOO_MANY;
  const parsed = CredentialsSchema.safeParse(raw);
  if (!parsed.success)
    return {
      status: "invalid",
      errors: firstFieldErrors(parsed.error.issues, FIELDS),
    };
  const supabase = await createSupabase();
  if (!supabase) return UNAVAILABLE;

  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: callbackUrl("/dashboard") },
  });
  if (error) {
    console.error("[supabase] sign-up failed:", error.message);
    return {
      status: "failed",
      message: "We could not create that account. Try signing in instead.",
    };
  }
  return { status: "check-email", email: parsed.data.email };
}

export async function signInWithGoogleAction(
  formData: FormData,
): Promise<void> {
  const next = NextPathSchema.parse(formData.get("next"));
  const supabase = await createSupabase();
  if (!supabase) redirect("/sign-in?error=unavailable");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl(next) },
  });
  if (error || !data.url) {
    console.error("[supabase] Google sign-in could not start:", error?.message);
    redirect("/sign-in?error=google");
  }
  if (!isHttpsUrl(data.url)) redirect("/sign-in?error=google");
  redirect(data.url);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabase();
  await supabase?.auth.signOut();
  redirect("/");
}

export async function updateDisplayNameAction(
  _previous: AuthStateType,
  formData: FormData,
): Promise<AuthStateType> {
  const raw = { displayName: formData.get("displayName") };
  const parsed = DisplayNameSchema.safeParse(raw);
  if (!parsed.success)
    return {
      status: "invalid",
      errors: firstFieldErrors(parsed.error.issues, FIELDS),
    };
  const [supabase, user] = await Promise.all([createSupabase(), currentUser()]);
  if (!supabase || !user)
    return {
      status: "failed",
      message: "Your session has ended. Sign in again.",
    };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName })
    .eq("id", user.id);
  if (error) {
    console.error("[supabase] profile update failed:", error.message);
    return { status: "failed", message: "That did not save. Try again." };
  }
  return { status: "saved" };
}

function callbackUrl(next: string): string {
  return new URL(
    `/auth/callback?next=${encodeURIComponent(next)}`,
    ENV.NEXT_PUBLIC_SITE_URL,
  ).href;
}

/** Narrows Supabase's OAuth URL to the absolute form typed routes accept, and refuses anything but https. */
function isHttpsUrl(url: string): url is `https:${string}` {
  return url.startsWith("https://");
}
