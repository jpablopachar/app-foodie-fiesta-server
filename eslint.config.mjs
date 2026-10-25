import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier/flat"
import { defineConfig } from "eslint/config"
import globals from "globals"

export default defineConfig([
  { ignores: ["node_modules/", "dist/", "coverage/"] },
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node } },
  eslintConfigPrettier,
]);
