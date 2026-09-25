"use client";

/**
 * The contact form. It posts to a Server Action, so it works as a plain form with
 * JavaScript off; with it on, errors appear beside their fields, focus moves to
 * the first one, and a live region announces the result.
 */
import { type ReactNode, useActionState, useEffect, useRef } from "react";
import { actionStyles } from "@/components/site/action-styles";
import { FormField } from "@/components/site/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendContactAction } from "../actions";
import { MESSAGE_MAX } from "../constants";
import type { ContactFieldType, ContactStateType } from "../types";

const INITIAL: ContactStateType = { status: "idle" };

const FIELD_ORDER: readonly ContactFieldType[] = ["name", "email", "message"];

export function ContactForm(): ReactNode {
  const [state, formAction, isPending] = useActionState(
    sendContactAction,
    INITIAL,
  );
  const form = useRef<HTMLFormElement>(null);
  const errors = state.status === "invalid" ? state.errors : {};
  const values =
    state.status === "invalid" || state.status === "failed" ? state.values : {};

  useEffect(() => {
    if (state.status !== "invalid") return;
    const first = FIELD_ORDER.find((field) => state.errors[field]);
    const control = first ? form.current?.elements.namedItem(first) : null;
    if (control instanceof HTMLElement) control.focus();
  }, [state]);

  if (state.status === "sent") {
    return (
      <div role="status" className="rounded-lg bg-brand-tint p-8 md:p-10">
        <p className="font-display text-2xl">Thanks. We have your message.</p>
        <p className="mt-3 text-ink-soft">
          A person will reply within two working days.
        </p>
      </div>
    );
  }

  return (
    <form
      ref={form}
      action={formAction}
      aria-busy={isPending}
      noValidate
      className="grid gap-6"
    >
      <p
        role="alert"
        className={
          state.status === "failed"
            ? "rounded-md bg-signal-tint px-5 py-4 text-signal"
            : "sr-only"
        }
      >
        {state.status === "failed" ? state.message : ""}
      </p>

      <FormField name="name" label="Your name" error={errors.name}>
        {(props) => (
          <Input
            {...props}
            autoComplete="name"
            defaultValue={values.name}
            required
          />
        )}
      </FormField>
      <FormField
        name="email"
        label="Email"
        hint="We reply to this address."
        error={errors.email}
      >
        {(props) => (
          <Input
            {...props}
            type="email"
            autoComplete="email"
            defaultValue={values.email}
            required
          />
        )}
      </FormField>
      <FormField
        name="message"
        label="Message"
        hint={`Up to ${MESSAGE_MAX.toLocaleString("en-IN")} characters.`}
        error={errors.message}
      >
        {(props) => (
          <Textarea
            {...props}
            rows={7}
            maxLength={MESSAGE_MAX}
            defaultValue={values.message}
            required
          />
        )}
      </FormField>

      <div aria-hidden="true" className="absolute left-[-100vw]">
        <label>
          Leave this empty
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <button
          type="submit"
          aria-disabled={isPending}
          onClick={(event) => {
            if (isPending) event.preventDefault();
          }}
          className={actionStyles("brand")}
        >
          {isPending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
