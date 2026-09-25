/** The contact form's fields and its action's result. */

export type ContactFieldType = "name" | "email" | "message";

export type ContactValuesType = Partial<Record<ContactFieldType, string>>;

export type ContactStateType =
  | { status: "idle" }
  | { status: "sent" }
  | {
      status: "invalid";
      errors: Partial<Record<ContactFieldType, string>>;
      values: ContactValuesType;
    }
  | { status: "failed"; message: string; values: ContactValuesType };
