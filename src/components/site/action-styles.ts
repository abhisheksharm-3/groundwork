/**
 * The three call-to-action treatments, shared by links and form buttons so a
 * "Get a pass" link and a "Send" button can never drift apart.
 */
const BASE =
  "label inline-flex items-center justify-center gap-2 rounded-md px-6 py-4 transition-[translate,box-shadow,background-color] duration-(--duration-quick) ease-(--ease-out-quart) disabled:opacity-60 aria-disabled:opacity-60";

const VARIANTS = {
  action:
    "bg-action text-action-ink shadow-press hover:-translate-y-0.5 active:translate-y-0 active:shadow-none",
  brand:
    "bg-brand text-on-brand shadow-lift hover:-translate-y-0.5 hover:bg-brand-bright active:translate-y-0",
  quiet:
    "px-0 underline decoration-1 underline-offset-[0.4em] hover:decoration-2",
} as const;

export type ActionVariantType = keyof typeof VARIANTS;

export function actionStyles(variant: ActionVariantType): string {
  return `${BASE} ${VARIANTS[variant]}`;
}
