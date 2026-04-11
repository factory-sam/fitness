import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    rules: {
      // Naming consistency: enforce camelCase for variables/functions,
      // PascalCase for types/interfaces, UPPER_CASE for constants
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "variable",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
      // Cyclomatic complexity: flag functions with complexity > 15
      complexity: ["warn", { max: 15 }],
      // Large file detection: warn on files exceeding 400 lines
      "max-lines": ["warn", { max: 400, skipBlankLines: true, skipComments: true }],
      // Tech debt tracking: flag TODO/FIXME comments so they don't accumulate
      "no-warning-comments": [
        "warn",
        { terms: ["todo", "fixme", "hack", "xxx"], location: "start" },
      ],
    },
  },
]);

export default eslintConfig;
