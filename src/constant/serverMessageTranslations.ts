const ERROR_CODE_OVERRIDES: Record<string, string> = {
  MARKETPLACE_033:
    "마켓플레이스 결제 기능이 현재 비활성화되어 있습니다. 잠시 후 다시 시도해 주세요.",
  MARKETPLACE_034: "예약에 사용한 지갑으로 전환한 뒤 다시 시도해 주세요.",
  MARKETPLACE_035: "이미 처리 중인 마켓플레이스 결제가 있습니다.",
  MARKETPLACE_036: "마켓플레이스 결제 기한 동기화가 필요합니다.",
  MARKETPLACE_037: "예약 결제 기한이 만료되어 환불이 필요합니다.",
  MARKETPLACE_038:
    "예약 가능한 결제 기한을 초과했습니다. 더 가까운 날짜나 시간을 선택해 주세요.",
  MARKETPLACE_039: "토큰 결제 승인 한도가 부족합니다.",
  MARKETPLACE_040: "토큰 잔액이 부족합니다.",
  MARKETPLACE_041: "확정된 마켓플레이스 결제 상태를 먼저 복구해야 합니다.",
  MARKETPLACE_042: "예약 승인 가능 시간이 만료되었습니다.",
  MARKETPLACE_043: "결제 서명 요청이 만료되었습니다. 다시 시도해 주세요.",
  MARKETPLACE_044: "이 마켓플레이스 결제 요청을 처리할 권한이 없습니다.",
  MARKETPLACE_045: "같은 예약 요청이 이미 다른 내용으로 처리 중입니다.",
  MARKETPLACE_046: "본인이 개설한 클래스는 구매할 수 없습니다.",
};

const SERVER_MESSAGE_OVERRIDES: Record<string, string> = {
  "Marketplace Web3 execution is disabled":
    "마켓플레이스 결제 기능이 현재 비활성화되어 있습니다. 잠시 후 다시 시도해 주세요.",
  "Reservation completion window does not fit before the marketplace escrow deadline":
    "예약 가능한 결제 기한을 초과했습니다. 더 가까운 날짜나 시간을 선택해 주세요.",
  "Reservation execution window has expired":
    "예약 처리 가능 시간이 만료되었습니다. 다시 시도해 주세요.",
  "Switch to the wallet used for this reservation":
    "예약에 사용한 지갑으로 전환한 뒤 다시 시도해 주세요.",
  "Marketplace execution is already in progress":
    "이미 처리 중인 마켓플레이스 결제가 있습니다.",
  "Marketplace deadline must be synced before this action":
    "마켓플레이스 결제 기한 동기화가 필요합니다.",
  "Reservation deadline expired; refund is required":
    "예약 결제 기한이 만료되어 환불이 필요합니다.",
  "Token allowance is insufficient for marketplace purchase":
    "토큰 결제 승인 한도가 부족합니다.",
  "Token balance is insufficient for marketplace purchase":
    "토큰 잔액이 부족합니다.",
  "Confirmed marketplace execution must be repaired first":
    "확정된 마켓플레이스 결제 상태를 먼저 복구해야 합니다.",
  "Reservation approval window has expired":
    "예약 승인 가능 시간이 만료되었습니다.",
  "Marketplace sign request is stale":
    "결제 서명 요청이 만료되었습니다. 다시 시도해 주세요.",
  "Marketplace execution is not owned by this user":
    "이 마켓플레이스 결제 요청을 처리할 권한이 없습니다.",
  "Marketplace idempotency key conflicts with another request":
    "같은 예약 요청이 이미 다른 내용으로 처리 중입니다.",
  "Buyer cannot purchase their own class":
    "본인이 개설한 클래스는 구매할 수 없습니다.",
};

const isAsciiWhitespace = (code: number) =>
  code === 9 || code === 10 || code === 13 || code === 32;

const isAsciiPrintable = (code: number) => code >= 33 && code <= 126;

export const getKnownKoreanErrorMessage = (
  code?: string | null,
  serverMessage?: string | null
): string | null => {
  if (code && ERROR_CODE_OVERRIDES[code]) return ERROR_CODE_OVERRIDES[code];
  if (serverMessage && SERVER_MESSAGE_OVERRIDES[serverMessage]) {
    return SERVER_MESSAGE_OVERRIDES[serverMessage];
  }
  return null;
};

export const isPlainEnglishServerMessage = (message?: string | null): boolean =>
  Boolean(
    message &&
    [...message].every((char) => {
      const code = char.charCodeAt(0);
      return isAsciiWhitespace(code) || isAsciiPrintable(code);
    })
  );
