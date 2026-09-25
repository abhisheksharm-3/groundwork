/** The contact form's fields, its action's result, and the props of its field wrapper. */
import type { ReactNode } from "react";

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

export type ControlPropsType = {
  id: string;
  name: string;
  className: string;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
};

export type FieldPropsType = {
  name: ContactFieldType;
  label: string;
  hint?: string;
  error?: string;
  children: (props: ControlPropsType) => ReactNode;
};
