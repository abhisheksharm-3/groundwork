"use client";

/**
 * The signed-in user, provided by the dashboard layout, a Server Component, which
 * renders this Context directly with no wrapper provider (React 19.3). Client
 * components below read it instead of having the user threaded through props.
 */
import { createContext, use } from "react";
import type { SessionUserType } from "../types";

export const SessionContext = createContext<SessionUserType | null>(null);

/** Throws outside the dashboard, where no session is provided: that is a wiring bug, not a state to render. */
export function useSessionUser(): SessionUserType {
  const user = use(SessionContext);
  if (!user)
    throw new Error("useSessionUser must be used inside the dashboard layout");
  return user;
}
