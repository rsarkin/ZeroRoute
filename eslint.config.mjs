import js from "@eslint/js";
import ts from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsdocPlugin from "eslint-plugin-jsdoc";

export default ts.config(
  {
    ignores: [".next/**", "node_modules/**", "*.config.mjs", "*.config.ts", "*.js", "functions/**"]
  },
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooksPlugin,
      "jsdoc": jsdocPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": "error",
      "no-restricted-syntax": [
        "error",
        {
          "selector": "ExportAllDeclaration",
          "message": "Barrel exports are not allowed. Please export components directly."
        },
        {
          "selector": "ExportNamedDeclaration[source.value=/^\\./]",
          "message": "Barrel exports from index files are not allowed."
        }
      ]
    }
  },
  {
    files: ["lib/**/*.ts", "lib/**/*.tsx"],
    rules: {
      "jsdoc/require-jsdoc": ["error", { "require": { "FunctionDeclaration": true, "ArrowFunctionExpression": true, "FunctionExpression": true } }]
    }
  },
  {
    files: ["**/*.tsx"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off"
    }
  }
);
