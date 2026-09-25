/**
 * The one way server code reports a failure someone should look at. It always
 * logs, and when a module that raises alerts is installed it does that too, which
 * matters most on the payment path: a gateway disables a webhook that keeps
 * failing for a day, and a log nobody reads will not stop that.
 */
import "server-only";
import { CAPABILITIES } from "@/modules/registry";

export function reportProblem(message: string, error?: unknown): void {
  console.error(message, ...(error === undefined ? [] : [error]));
  CAPABILITIES.reportProblem?.(message, error);
}
