import js from "@eslint/js"
import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import importPlugin from "eslint-plugin-import"

const unusedVarOptions = {
  argsIgnorePattern: "^_",
  varsIgnorePattern: "^_",
  caughtErrorsIgnorePattern: "^_",
}

export default defineConfig([
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
  ]),

  js.configs.recommended,

  ...nextVitals,

  ...nextTs,

  {
    name: "crs-project/js-unused",
    files: ["**/*.{js,jsx,mjs}"],
    rules: {
      "no-unused-vars": ["warn", unusedVarOptions],
    },
  },

  {
    name: "crs-project/ts-unused",
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", unusedVarOptions],
    },
  },

  {
    name: "crs-project/style",
    files: ["**/*.{js,jsx,mjs,ts,tsx}"],
    plugins: {
      import: importPlugin,
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "prefer-const": "warn",
      eqeqeq: ["warn", "always", { null: "ignore" }],
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "object",
            "type",
          ],
          pathGroups: [
            { pattern: "react", group: "external", position: "before" },
            { pattern: "react-dom", group: "external", position: "before" },
            { pattern: "next", group: "external", position: "before" },
            { pattern: "next/**", group: "external", position: "before" },
            { pattern: "@/**", group: "internal" },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/no-duplicates": "warn",
      "import/no-named-as-default-member": "warn",
    },
  },
])
