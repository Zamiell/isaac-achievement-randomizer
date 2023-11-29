/** @type {import("eslint").Linter.Config} */
const config = {
  extends: ["../.eslintrc.cjs"],

  parserOptions: {
    project: "./website/tsconfig.eslint.json",
  },

  ignorePatterns: ["main.js"],

  rules: {
    "isaacscript/no-throw": "off",
    "@typescript-eslint/no-restricted-imports": "off",
  },
};

module.exports = config;
