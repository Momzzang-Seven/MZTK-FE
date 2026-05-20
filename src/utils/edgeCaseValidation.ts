import DOMPurify from "dompurify";
import { ethers } from "ethers";

export const TEXT_LIMITS = {
  tag: 30,
  comment: 500,
  freePost: 1000,
  answer: 2000,
  richContent: 2000,
} as const;

const UNSAFE_TEXT_PATTERN =
  /<\s*\/?\s*(script|iframe|object|embed|link|style|meta|svg|math|video|audio|source|form|input|button|textarea|select|option)\b|javascript\s*:|data\s*:/i;

export const containsUnsafeMarkup = (value: string) =>
  UNSAFE_TEXT_PATTERN.test(value);

export const getPlainTextLength = (value: string) => {
  const doc = new DOMParser().parseFromString(value, "text/html");
  return (doc.body.textContent ?? value).trim().length;
};

export const sanitizeRichHtml = (value: string) =>
  DOMPurify.sanitize(value, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["imageId", "imageid"],
    FORBID_TAGS: [
      "script",
      "iframe",
      "object",
      "embed",
      "link",
      "style",
      "meta",
      "svg",
      "math",
      "form",
      "input",
      "button",
      "textarea",
      "select",
      "option",
    ],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
  });

export const sanitizeTags = (tags: string[]) =>
  tags
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean)
    .filter((tag) => tag.length <= TEXT_LIMITS.tag)
    .filter((tag) => !containsUnsafeMarkup(tag));

export const parsePositiveIntegerInput = (value: string | number) => {
  const raw = String(value).trim();
  if (!/^[1-9]\d*$/.test(raw)) return null;

  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) ? parsed : null;
};

export const isValidKoreanPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (/^01[016789]\d{7,8}$/.test(digits)) return true;
  if (/^02\d{7,8}$/.test(digits)) return true;
  if (/^0(?:3[1-3]|4[1-4]|5[1-5]|6[1-4]|70)\d{7,8}$/.test(digits)) {
    return true;
  }

  return false;
};

export const normalizeOptionalHttpUrl = (value: string) => {
  const raw = value.trim();
  if (!raw) return null;

  if (/[<>\s]/.test(raw)) {
    throw new Error("URL contains invalid characters.");
  }

  const explicitProtocol = raw.match(/^([a-z][a-z\d+\-.]*):/i)?.[1];
  if (explicitProtocol && !/^https?$/i.test(explicitProtocol)) {
    throw new Error("Only http and https URLs are allowed.");
  }

  const candidate = explicitProtocol ? raw : `https://${raw}`;
  const parsed = new URL(candidate);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs are allowed.");
  }

  if (
    /(?:^|[^a-z])(javascript|data|ftp):/i.test(
      parsed.href.replace(/^https?:\/\//i, "")
    )
  ) {
    throw new Error("Nested or unsafe URL protocols are not allowed.");
  }

  return parsed.toString();
};

export const isWeakPin = (pin: string) => {
  if (!/^\d{6}$/.test(pin)) return true;
  if (/^(\d)\1{5}$/.test(pin)) return true;

  const digits = pin.split("").map(Number);
  const isAscending = digits.every((digit, index) => {
    if (index === 0) return true;
    return digit === digits[index - 1] + 1;
  });
  const isDescending = digits.every((digit, index) => {
    if (index === 0) return true;
    return digit === digits[index - 1] - 1;
  });

  return isAscending || isDescending;
};

export const isValidTokenAmount = (amount: string, balance: number) => {
  const raw = amount.trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,18})?$/.test(raw)) return false;

  try {
    const parsedAmount = ethers.parseUnits(raw, 18);
    if (parsedAmount <= 0n) return false;

    const parsedBalance = ethers.parseUnits(
      Number.isFinite(balance) ? balance.toString() : "0",
      18
    );
    return parsedAmount <= parsedBalance;
  } catch {
    return false;
  }
};

export const normalizeNonZeroAddress = (address: string) => {
  const candidate = address.trim();
  if (!candidate) return null;

  const withPrefix = candidate.startsWith("0x") ? candidate : `0x${candidate}`;
  if (!ethers.isAddress(withPrefix)) return null;

  const checksummed = ethers.getAddress(withPrefix);
  return checksummed === ethers.ZeroAddress ? null : checksummed;
};
