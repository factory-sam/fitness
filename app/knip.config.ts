import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["src/app/**/*.{ts,tsx}"],
  project: ["src/**/*.{ts,tsx}"],
  ignoreDependencies: [
    "postcss", // loaded by @tailwindcss/postcss via postcss.config.mjs
    "tailwindcss", // peer dep of @tailwindcss/postcss, imported via CSS @import
    "@vitest/coverage-v8", // referenced in vitest.config.ts coverage provider
  ],
};

export default config;
