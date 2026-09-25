/** The first validation message for each form field, keyed by field, for showing beside that field. */
import type { z } from "zod";

export function firstFieldErrors<FieldType extends string>(
  issues: readonly z.core.$ZodIssue[],
  fields: readonly FieldType[],
): Partial<Record<FieldType, string>> {
  const errors: Partial<Record<FieldType, string>> = {};
  for (const issue of issues) {
    const field = fields.find((name) => name === issue.path[0]);
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}
