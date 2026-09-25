/**
 * The slice of the Trusted Types API this site uses. TypeScript's DOM lib does
 * not declare it yet. `createScriptURL` is typed as returning a string so the
 * result can be assigned to `script.src`; at run time it is a TrustedScriptURL,
 * which is exactly what that sink accepts under `require-trusted-types-for`.
 */
type TrustedScriptUrlRulesType = { createScriptURL: (input: string) => string };

type TrustedTypePolicyType = { createScriptURL: (input: string) => string };

interface Window {
  trustedTypes?: {
    createPolicy: (
      name: string,
      rules: TrustedScriptUrlRulesType,
    ) => TrustedTypePolicyType;
  };
}
