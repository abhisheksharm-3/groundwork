/**
 * The one place optional modules plug into the core. A module owns a marked
 * import and a marked entry here; setup.ts deletes both when the module is
 * dropped, and the core falls back for any capability that is missing. Modules
 * never import each other, so a strip can never leave a dangling import.
 */
import type { CapabilitiesType } from "@/types/capabilities";

export const CAPABILITIES: CapabilitiesType = {};
