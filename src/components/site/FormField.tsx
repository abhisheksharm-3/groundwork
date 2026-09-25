"use client";

/**
 * A labelled form control. The hint and the error sit outside the `<label>` and
 * are wired by `aria-describedby`, because text inside a label becomes part of
 * the field's accessible name and would change it after a failed submit.
 */
import { cn } from "cn";
import { type ReactNode, useId } from "react";
import { Label } from "@/components/ui/label";
import type { FormFieldPropsType } from "@/types/ui";

export function FormField({
  name,
  label,
  hint,
  error,
  children,
}: FormFieldPropsType): ReactNode {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="label text-ink">
        {label}
      </Label>
      {children({
        id,
        name,
        className: cn("bg-surface text-base", error && "border-signal"),
        "aria-invalid": error ? true : undefined,
        "aria-describedby":
          [hintId, errorId].filter(Boolean).join(" ") || undefined,
      })}
      {hint ? (
        <span id={hintId} className="text-sm text-ink-soft">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className="text-sm text-signal">
          {error}
        </span>
      ) : null}
    </div>
  );
}
