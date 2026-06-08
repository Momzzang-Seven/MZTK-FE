export const REGISTER_WALLET_STEPS = {
  AUTH_PIN: "AUTH_PIN",
  MNEMONIC: "MNEMONIC",
  REGISTERING: "REGISTERING",
  PROLONGED_PENDING: "PROLONGED_PENDING",
  RETRY_PROMPT: "RETRY_PROMPT",
  SUPPORT: "SUPPORT",
  RESTART_PROMPT: "RESTART_PROMPT",
  PIN_SET: "PIN_SET",
  PIN_CONFIRM: "PIN_CONFIRM",
  SUCCESS: "SUCCESS",
} as const;

export type RegisterWalletStep =
  (typeof REGISTER_WALLET_STEPS)[keyof typeof REGISTER_WALLET_STEPS];

export const REGISTER_WALLET_STORAGE_KEYS = {
  encryptedWallet: "encrypted_wallet",
  walletAddress: "wallet_address",
} as const;

export const REGISTER_WALLET_CONFIG = {
  mnemonicWordCount: 12,
  pinLength: 6,
  pollIntervalMs: 3000,
  maxPollAttempts: 30,
} as const;

export const REGISTER_WALLET_MESSAGES = {
  modal: {
    sameWallet: {
      title: "기존 지갑과 동일한 지갑입니다.",
      desc: "기존 지갑과 다른 지갑을 연결해 주세요.",
    },
    invalidMnemonic: {
      title: "비밀복구 구문 확인 실패",
      desc: "입력하신 구문이 올바르지 않습니다. 다시 확인해 주세요.",
    },
    retryFailed: "재시도에 실패했습니다.",
    pinSaveFailed: {
      title: "PIN 저장 실패",
      desc: "PIN 저장에 실패했습니다. 다시 입력해 주세요.",
    },
    authPinFailed: {
      title: "PIN 번호 인증 실패",
      desc: "잘못된 PIN 번호입니다. 다시 입력해 주세요.",
    },
    weakPin: {
      title: "Weak PIN",
      desc: "Sequential PINs are not allowed.",
    },
    pinMismatch: {
      title: "PIN 번호 불일치",
      desc: "처음 입력한 PIN 번호와 다릅니다. 다시 입력해 주세요.",
    },
    confirmRetry: "다시 시도하기",
    registrationFailed: {
      title: "등록 실패",
      confirm: "확인",
    },
  },
  progress: {
    registering: "지갑 등록을 처리하고 있습니다...",
  },
  authPin: {
    title: "기존 PIN 번호 인증",
    descLines: [
      "지갑을 변경하기 위해",
      "기존에 설정한 PIN 번호를 입력해주세요",
    ],
  },
  mnemonic: {
    descLines: ["연결하실 지갑의 비밀복구구문", "12개 단어를 입력해주세요"],
  },
  prolongedPending: {
    title: "확인이 늦어지고 있어요",
    description:
      "트랜잭션 확정에 시간이 걸리고 있습니다. 더 기다리거나 나중에 니모닉을 입력해 확인해볼 수 있어요.",
    buttonLabel: "계속 확인하기",
  },
  retryPrompt: {
    title: "승인 서명이 만료되었어요",
    description:
      "지갑 승인 요청을 새로 받아 다시 시도해야 합니다. 아래 버튼을 눌러 진행해 주세요.",
    buttonLabel: "다시 시도하기",
  },
  support: {
    title: "등록 처리 중 문제가 발생했어요",
    description:
      "관리자에게 문의 후 복구가 필요합니다. 잠시 후 다시 확인해 주세요.",
    buttonLabel: "확인",
  },
  restartPrompt: {
    title: "지갑 등록이 완료되지 못했어요",
    description: "비밀복구 구문 입력부터 다시 진행해 주세요.",
    buttonLabel: "처음부터 다시 시도하기",
  },
  pinSet: {
    title: "새로운 PIN 번호 설정",
    descLines: [
      "앞으로 지갑 이용 승인 시 사용하실",
      "6자리 숫자를 입력해주세요",
    ],
  },
  pinConfirm: {
    title: "PIN 번호 확인",
    descLines: ["방금 입력한 6자리 숫자를", "한 번 더 입력해주세요"],
  },
  success: {
    title: "지갑이 등록되었어요",
    description: "이제 서비스의 모든 기능을 이용하실 수 있어요.",
    buttonLabel: "확인",
  },
} as const;
