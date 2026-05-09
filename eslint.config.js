import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import unusedImports from "eslint-plugin-unused-imports"; // 1. 플러그인 가져오기

export default defineConfig([
  globalIgnores(["dist", "develop", ".git", ".cache"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended, // Flat Config에서는 스프레드 연산자 확인 필요
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    plugins: {
      "unused-imports": unusedImports, // 2. 플러그인 등록
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // 3. 규칙 설정
      "@typescript-eslint/no-unused-vars": "off", // 기본 규칙은 끄기
      "unused-imports/no-unused-imports": "error", // 안 쓰는 임포트 자동 삭제 (핵심!)
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
]);
