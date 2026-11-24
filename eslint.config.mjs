import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    // Test builds in another folder (NEXT_DIST_DIR=.next-check).
    ".next-*/**",
    "out/**",
    "build/**",
  ]),
]);

export default eslintConfig;
