"use client";

/** Email and password sign-in or sign-up, and the Google button, which is its own form posting to its own action. */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useActionState } from "react";
import { actionStyles } from "@/components/site/action-styles";
import { FormField } from "@/components/site/FormField";
import { Input } from "@/components/ui/input";
import { signInAction, signInWithGoogleAction, signUpAction } from "../actions";
import type { AuthFormPropsType, AuthStateType } from "../types";

const INITIAL: AuthStateType = { status: "idle" };

const RETURN_ERRORS: Record<string, string> = {
  google: "Google sign-in could not start. Try again, or use your email.",
  unavailable: "Accounts are not switched on yet.",
  callback: "That sign-in link has expired or was already used. Sign in again.",
};

const COPY = {
  "sign-in": {
    submit: "Sign in",
    pending: "Signing in…",
    switchText: "No account yet?",
    switchLink: "Create one",
  },
  "sign-up": {
    submit: "Create account",
    pending: "Creating…",
    switchText: "Already have one?",
    switchLink: "Sign in",
  },
} as const;

export function AuthForm({ mode }: AuthFormPropsType): ReactNode {
  const [state, formAction, isPending] = useActionState(
    mode === "sign-in" ? signInAction : signUpAction,
    INITIAL,
  );
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const returnError = RETURN_ERRORS[params.get("error") ?? ""];
  const errors = state.status === "invalid" ? state.errors : {};
  const copy = COPY[mode];

  if (state.status === "check-email") {
    return (
      <div role="status" className="rounded-lg bg-brand-tint p-8">
        <p className="font-display text-2xl">Check your inbox</p>
        <p className="mt-3 text-ink-soft">
          We sent a link to {state.email}. Open it on this device to finish
          signing up.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <form action={signInWithGoogleAction}>
        <input type="hidden" name="next" value={next} />
        <button type="submit" className={`${actionStyles("brand")} w-full`}>
          Continue with Google
        </button>
      </form>
      <p className="label text-center text-ink-soft">or with email</p>
      <form
        action={formAction}
        aria-busy={isPending}
        noValidate
        className="grid gap-6"
      >
        <input type="hidden" name="next" value={next} />
        <p
          role="alert"
          className={
            state.status === "failed" || returnError
              ? "rounded-md bg-signal-tint px-5 py-4 text-signal"
              : "sr-only"
          }
        >
          {state.status === "failed" ? state.message : (returnError ?? "")}
        </p>
        <FormField name="email" label="Email" error={errors.email}>
          {(props) => (
            <Input {...props} type="email" autoComplete="email" required />
          )}
        </FormField>
        <FormField
          name="password"
          label="Password"
          hint={mode === "sign-up" ? "At least 8 characters." : undefined}
          error={errors.password}
        >
          {(props) => (
            <Input
              {...props}
              type="password"
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              required
            />
          )}
        </FormField>
        <button
          type="submit"
          aria-disabled={isPending}
          className={actionStyles("action")}
        >
          {isPending ? copy.pending : copy.submit}
        </button>
      </form>
      <p className="text-ink-soft">
        {copy.switchText}{" "}
        <Link
          href={mode === "sign-in" ? "/sign-up" : "/sign-in"}
          className="text-brand underline underline-offset-4"
        >
          {copy.switchLink}
        </Link>
      </p>
    </div>
  );
}
