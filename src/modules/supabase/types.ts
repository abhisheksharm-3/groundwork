/** The signed-in user as the app sees it, the auth forms' results, and the profile row. */
import type { z } from "zod";
import type { ProfileSchema } from "./schemas";

export type ProfileType = z.infer<typeof ProfileSchema>;

export type SessionUserType = {
  id: string;
  email: string;
  displayName: string;
};

export type AuthFieldType = "email" | "password" | "displayName";

export type AuthStateType =
  | { status: "idle" }
  | { status: "invalid"; errors: Partial<Record<AuthFieldType, string>> }
  | { status: "failed"; message: string }
  | { status: "check-email"; email: string }
  | { status: "saved" };

export type AuthModeType = "sign-in" | "sign-up";

export type AuthFormPropsType = { mode: AuthModeType };
