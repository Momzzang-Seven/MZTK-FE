import axios from "axios";

const SANCTION_ERROR_CODES = new Set([
  "ACCOUNT_BLOCKED",
  "ACCOUNT_BANNED",
  "ACCOUNT_SANCTIONED",
  "USER_BLOCKED",
  "USER_BANNED",
  "USER_SANCTIONED",
]);

const NON_SANCTION_FORBIDDEN_CODES = new Set([
  "ANSWER_002",
  "AUTH_008",
  "COMMENT_002",
  "IMAGE_009",
  "POST_002",
  "VERIFICATION_004",
]);

const SANCTION_KEYWORDS = [
  "account blocked",
  "account banned",
  "account sanctioned",
  "blocked account",
  "banned account",
  "sanctioned account",
  "suspended account",
  "blocked",
  "banned",
  "sanction",
  "suspended",
  "제재",
  "정지",
  "차단",
];

interface AuthErrorOptions {
  allowBareForbidden?: boolean;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const collectStrings = (value: unknown): string[] => {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (!isObject(value)) return [];

  return Object.values(value).flatMap(collectStrings);
};

const collectCodes = (value: unknown): string[] => {
  if (!isObject(value)) return [];

  const codes = [value.code, value.errorCode]
    .filter((code): code is string => typeof code === "string")
    .map((code) => code.toUpperCase());

  return [...codes, ...collectCodes(value.data)];
};

export const isSanctionedAccountError = (
  error: unknown,
  options: AuthErrorOptions = {}
) => {
  if (!axios.isAxiosError(error)) return false;

  const status = error.response?.status;
  const data = error.response?.data;
  const codes = collectCodes(data);

  if (codes.some((code) => NON_SANCTION_FORBIDDEN_CODES.has(code))) {
    return false;
  }

  if (codes.some((code) => SANCTION_ERROR_CODES.has(code))) {
    return true;
  }

  const message = collectStrings(data).join(" ").toLowerCase();
  if (SANCTION_KEYWORDS.some((keyword) => message.includes(keyword))) {
    return true;
  }

  return status === 403 && options.allowBareForbidden === true;
};
