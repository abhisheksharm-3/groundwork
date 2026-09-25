"use client";

/** Edits what the site calls the signed-in user. The current name comes from the session Context. */
import { type ReactNode, useActionState } from "react";
import { actionStyles } from "@/components/site/action-styles";
import { FormField } from "@/components/site/FormField";
import { Input } from "@/components/ui/input";
import { updateDisplayNameAction } from "../actions";
import type { AuthStateType } from "../types";
import { useSessionUser } from "./SessionContext";

const INITIAL: AuthStateType = { status: "idle" };

export function DisplayNameForm(): ReactNode {
  const user = useSessionUser();
  const [state, formAction, isPending] = useActionState(
    updateDisplayNameAction,
    INITIAL,
  );
  const errors = state.status === "invalid" ? state.errors : {};
  const message =
    state.status === "saved"
      ? "Saved."
      : state.status === "failed"
        ? state.message
        : "";

  return (
    <form
      action={formAction}
      aria-busy={isPending}
      className="grid max-w-(--container-prose) gap-6"
    >
      <FormField
        name="displayName"
        label="What should we call you?"
        error={errors.displayName}
      >
        {(props) => (
          <Input
            {...props}
            defaultValue={user.displayName}
            autoComplete="nickname"
            required
          />
        )}
      </FormField>
      <div className="flex items-center gap-6">
        <button
          type="submit"
          aria-disabled={isPending}
          className={actionStyles("brand")}
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        <p role="status" className="text-ink-soft">
          {message}
        </p>
      </div>
    </form>
  );
}
