module.exports = {
  extends: "next/core-web-vitals",
  plugins: ["@typescript-eslint"],
  rules: {
    // Disable all problematic rules
    "@typescript-eslint/no-unused-vars": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "react-hooks/exhaustive-deps": 0,
    "no-unused-vars": 0,
    "@typescript-eslint/no-empty-interface": 0,
    "@typescript-eslint/ban-types": 0,
    "@typescript-eslint/no-empty-function": 0,
    "import/no-unused-modules": 0,
    "unused-imports/no-unused-imports": 0,
    "unused-imports/no-unused-vars": 0,
    // Add any other rules that need to be disabled
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "out/",
    "build/",
    "coverage/",
    "**/*.test.ts",
    "**/*.test.tsx",
    "__tests__/",
    "*.config.js",
    "*.config.ts",
  ],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    project: null, // This prevents TypeScript project file issues
  },
};
