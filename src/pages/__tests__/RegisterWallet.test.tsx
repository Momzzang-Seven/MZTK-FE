import type { ReactNode } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterWallet from "../RegisterWallet";
import type {
  RegisterWalletResponse,
  WalletRegistrationStatusResponse,
} from "@types";

const WALLET_ADDRESS = "0x2222222222222222222222222222222222222222";
const MNEMONIC_WORDS = vi.hoisted(() => [
  "alpha",
  "bravo",
  "charlie",
  "delta",
  "echo",
  "foxtrot",
  "golf",
  "hotel",
  "india",
  "juliet",
  "kilo",
  "lima",
]);

const mockNavigate = vi.hoisted(() => vi.fn());
const mockSetWalletAddress = vi.hoisted(() => vi.fn());
const mockHandleWalletRegistration = vi.hoisted(() => vi.fn());
const mockHandleUnlinkWallet = vi.hoisted(() => vi.fn());
const mockHandleWeb3Signature = vi.hoisted(() => vi.fn());
const mockGetStatus = vi.hoisted(() => vi.fn());
const mockRetryIntent = vi.hoisted(() => vi.fn());
const mockSetWalletError = vi.hoisted(() => vi.fn());
const mockEncrypt = vi.hoisted(() => vi.fn());
const mockPinSequence = vi.hoisted(() => ({
  values: ["1", "3", "5", "7", "9", "0"],
}));
const mockWallet = vi.hoisted(() => ({
  address: "0x2222222222222222222222222222222222222222",
  encrypt: mockEncrypt,
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom"
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("ethers", () => ({
  ethers: {
    HDNodeWallet: {
      fromPhrase: vi.fn(() => mockWallet),
    },
    Wallet: {
      fromEncryptedJson: vi.fn(),
    },
  },
}));

vi.mock("@hooks", () => ({
  useWalletService: () => ({
    loading: false,
    error: null,
    setError: mockSetWalletError,
    handleWalletRegistration: mockHandleWalletRegistration,
    handleUnlinkWallet: mockHandleUnlinkWallet,
    handleWeb3Signature: mockHandleWeb3Signature,
  }),
}));

vi.mock("@services", () => ({
  walletService: {
    getWalletRegistrationStatus: mockGetStatus,
    retryWalletApprovalIntent: mockRetryIntent,
  },
}));

vi.mock("@store", () => {
  const state = {
    setWalletAddress: mockSetWalletAddress,
  };
  return {
    useUserStore: vi.fn(<T,>(selector?: (s: typeof state) => T) =>
      selector ? selector(state) : state
    ),
  };
});

vi.mock("@components/layout", () => ({
  FullScreenPage: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@components/common", () => ({
  CommonModal: ({ title, desc }: { title?: ReactNode; desc?: ReactNode }) => (
    <div role="dialog">
      <h2>{title}</h2>
      <p>{desc}</p>
    </div>
  ),
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}));

vi.mock("@components/auth/MnemonicForm", () => ({
  MnemonicForm: ({
    onBulkChange,
    onSubmit,
  }: {
    onBulkChange: (words: string[]) => void;
    onSubmit: () => void;
  }) => (
    <div>
      <button type="button" onClick={() => onBulkChange(MNEMONIC_WORDS)}>
        paste mnemonic
      </button>
      <button type="button" onClick={onSubmit}>
        submit mnemonic
      </button>
    </div>
  ),
}));

vi.mock("@components/auth/PinPad", () => ({
  PinPad: ({
    title,
    onInput,
  }: {
    title?: string;
    onInput: (value: string) => void;
  }) => (
    <button
      data-testid="pin-pad"
      data-title={title}
      type="button"
      onClick={() => {
        for (const value of mockPinSequence.values) {
          onInput(value);
        }
      }}
    >
      enter pin
    </button>
  ),
}));

vi.mock("@components/wallet/WalletSuccessSection", () => ({
  WalletSuccessSection: ({
    title,
    buttonLabel,
    onConfirm,
  }: {
    title?: ReactNode;
    buttonLabel?: string;
    onConfirm: () => void;
  }) => (
    <div data-testid="wallet-success-section">
      <h2>{title}</h2>
      <button type="button" onClick={onConfirm}>
        {buttonLabel ?? "wallet success"}
      </button>
    </div>
  ),
}));

const completeMnemonicStep = async () => {
  fireEvent.click(screen.getByRole("button", { name: "paste mnemonic" }));
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "submit mnemonic" }));
  });
};

const buildRegistered = (): RegisterWalletResponse => ({
  registrationId: null,
  status: "REGISTERED",
  walletId: 101,
  walletAddress: WALLET_ADDRESS,
  registeredAt: "2026-05-13T10:15:00Z",
  nextAction: "DONE",
  web3: null,
});

const buildSignApproval = (
  executionIntentId = "intent-1"
): RegisterWalletResponse => ({
  registrationId: "reg-1",
  status: "APPROVAL_REQUIRED",
  walletId: null,
  walletAddress: WALLET_ADDRESS,
  registeredAt: null,
  nextAction: "SIGN_APPROVAL",
  web3: {
    resource: {
      type: "WALLET_REGISTRATION",
      id: "reg-1",
      status: "PENDING_EXECUTION",
    },
    actionType: "WALLET_ESCROW_APPROVE",
    executionIntent: {
      id: executionIntentId,
      status: "AWAITING_SIGNATURE",
      expiresAt: "2026-05-13T10:05:00",
    },
    execution: { mode: "EIP7702", signCount: 2 },
    signRequest: {
      authorization: {
        chainId: 11155420,
        delegateTarget: "0x1111111111111111111111111111111111111111",
        authorityNonce: 7,
        payloadHashToSign: "0xaaaa",
      },
      submit: { executionDigest: "0xbbbb", deadlineEpochSeconds: 1778643900 },
      transaction: {
        chainId: 11155420,
        fromAddress: WALLET_ADDRESS,
        toAddress: "0x4444444444444444444444444444444444444444",
        valueHex: "0x0",
        data: "0x",
        nonce: 0,
        gasLimitHex: "0x5208",
        maxPriorityFeePerGasHex: "0x1",
        maxFeePerGasHex: "0x2",
        expectedNonce: 0,
      },
    },
    existing: false,
  },
});

const buildStatus = (
  status: WalletRegistrationStatusResponse["status"],
  nextAction: WalletRegistrationStatusResponse["nextAction"]
): WalletRegistrationStatusResponse => ({
  registrationId: "reg-1",
  status,
  walletAddress: WALLET_ADDRESS,
  registeredWalletId: status === "REGISTERED" ? 101 : null,
  latestExecutionIntentId: "intent-1",
  latestExecutionStatus:
    status === "REGISTERED" ? "CONFIRMED" : "PENDING_ONCHAIN",
  approvalExpiresAt: "2026-05-13T10:30:00",
  transaction: null,
  lastErrorCode: null,
  lastErrorReason: null,
  signRequestUnavailableReason: null,
  nextAction,
  web3: null,
});

const buildReceiptTimeoutStatus = (
  status: Extract<
    WalletRegistrationStatusResponse["status"],
    "APPROVAL_RETRYABLE" | "APPROVAL_FAILED"
  >,
  nextAction: Extract<
    WalletRegistrationStatusResponse["nextAction"],
    "RETRY_APPROVAL" | "NONE"
  >
): WalletRegistrationStatusResponse => ({
  ...buildStatus(status, nextAction),
  transaction: {
    transactionId: 42,
    transactionStatus: "UNCONFIRMED",
    txHash:
      "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
  },
  lastErrorCode: "RECEIPT_TIMEOUT",
  lastErrorReason:
    "Receipt was not confirmed before the backend polling window timed out.",
});

describe("RegisterWallet", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockEncrypt.mockResolvedValue("encrypted-wallet-json");
    mockHandleWalletRegistration.mockResolvedValue(buildRegistered());
    mockHandleUnlinkWallet.mockResolvedValue(undefined);
    mockHandleWeb3Signature.mockResolvedValue(undefined);
    mockPinSequence.values = ["1", "3", "5", "7", "9", "0"];
  });

  it("immediately routes to PIN setup when backend reports REGISTERED", async () => {
    render(<RegisterWallet />);

    await completeMnemonicStep();

    await waitFor(() => {
      expect(mockHandleWalletRegistration).toHaveBeenCalledWith(mockWallet);
    });

    // 등록 완료 후 PIN_SET → 첫 번째 PinPad
    const firstPinPad = await screen.findByTestId("pin-pad");
    expect(firstPinPad.getAttribute("data-title")).toBe("새로운 PIN 번호 설정");
    await act(async () => {
      fireEvent.click(firstPinPad);
    });

    // PIN_CONFIRM
    const secondPinPad = await screen.findByTestId("pin-pad");
    expect(secondPinPad.getAttribute("data-title")).toBe("PIN 번호 확인");
    await act(async () => {
      fireEvent.click(secondPinPad);
    });

    await waitFor(() => {
      expect(mockEncrypt).toHaveBeenCalledWith("135790");
    });
    expect(localStorage.getItem("encrypted_wallet")).toBe(
      "encrypted-wallet-json"
    );
    expect(localStorage.getItem("wallet_address")).toBe(WALLET_ADDRESS);
    expect(mockSetWalletAddress).toHaveBeenCalledWith(WALLET_ADDRESS);
    expect(await screen.findByText("지갑이 등록되었어요")).toBeInTheDocument();
  });

  it("signs, polls, and reaches PIN setup once approval transaction confirms", async () => {
    mockHandleWalletRegistration.mockResolvedValue(buildSignApproval());
    mockGetStatus
      .mockResolvedValueOnce(
        buildStatus("APPROVAL_PENDING_ONCHAIN", "WAIT_FOR_APPROVAL_TRANSACTION")
      )
      .mockResolvedValueOnce(buildStatus("REGISTERED", "DONE"));

    render(<RegisterWallet />);

    await completeMnemonicStep();

    await waitFor(() => {
      expect(mockHandleWeb3Signature).toHaveBeenCalled();
    });

    await waitFor(
      () => {
        expect(mockGetStatus).toHaveBeenCalledTimes(2);
      },
      { timeout: 10000 }
    );

    const firstPinPad = await screen.findByTestId("pin-pad");
    expect(firstPinPad.getAttribute("data-title")).toBe("새로운 PIN 번호 설정");
  }, 15000);

  it("does not persist local wallet state when backend registration fails", async () => {
    mockHandleWalletRegistration.mockRejectedValue(new Error("server error"));

    render(<RegisterWallet />);

    await completeMnemonicStep();

    expect(
      await screen.findByText("지갑 등록이 완료되지 못했어요")
    ).toBeInTheDocument();
    expect(mockEncrypt).not.toHaveBeenCalled();
    expect(localStorage.getItem("encrypted_wallet")).toBeNull();
    expect(localStorage.getItem("wallet_address")).toBeNull();
    expect(mockSetWalletAddress).not.toHaveBeenCalled();
  });

  it("shows retry UI when backend reports RETRY_APPROVAL", async () => {
    mockHandleWalletRegistration.mockResolvedValue({
      ...buildSignApproval(),
      status: "APPROVAL_RETRYABLE",
      nextAction: "RETRY_APPROVAL",
      web3: null,
    });

    render(<RegisterWallet />);

    await completeMnemonicStep();

    expect(
      await screen.findByText("승인 서명이 만료되었어요")
    ).toBeInTheDocument();
  });

  it("stops polling and signs a new approval intent after receipt timeout retry", async () => {
    mockHandleWalletRegistration.mockResolvedValue(buildSignApproval());
    mockGetStatus.mockResolvedValueOnce(
      buildReceiptTimeoutStatus("APPROVAL_RETRYABLE", "RETRY_APPROVAL")
    );
    mockRetryIntent.mockResolvedValue({
      ...buildStatus("APPROVAL_REQUIRED", "SIGN_APPROVAL"),
      latestExecutionIntentId: "intent-2",
      web3: buildSignApproval("intent-2").web3,
    });

    render(<RegisterWallet />);

    await completeMnemonicStep();

    const retrySection = await screen.findByTestId(
      "wallet-success-section",
      {},
      { timeout: 10000 }
    );
    const retryButton = retrySection.querySelector("button");
    expect(retryButton).not.toBeNull();

    await act(async () => {
      fireEvent.click(retryButton as HTMLButtonElement);
    });

    await waitFor(() => {
      expect(mockRetryIntent).toHaveBeenCalledWith("reg-1");
    });
    expect(mockHandleWeb3Signature).toHaveBeenLastCalledWith(
      "intent-2",
      mockWallet,
      buildSignApproval("intent-2").web3
    );
  }, 15000);

  it("stops polling and asks for restart when receipt timeout is no longer retryable", async () => {
    mockHandleWalletRegistration.mockResolvedValue(buildSignApproval());
    mockGetStatus.mockResolvedValueOnce(
      buildReceiptTimeoutStatus("APPROVAL_FAILED", "NONE")
    );

    render(<RegisterWallet />);

    await completeMnemonicStep();

    expect(
      await screen.findByTestId(
        "wallet-success-section",
        {},
        { timeout: 10000 }
      )
    ).toBeInTheDocument();
    expect(mockGetStatus).toHaveBeenCalledTimes(1);
  }, 15000);

  it("rejects weak repeated PINs before persisting local wallet", async () => {
    mockPinSequence.values = ["0", "0", "0", "0", "0", "0"];

    render(<RegisterWallet />);

    await completeMnemonicStep();
    const pinPad = await screen.findByTestId("pin-pad");
    await act(async () => {
      fireEvent.click(pinPad);
    });

    expect(await screen.findByRole("dialog")).toHaveTextContent("Weak PIN");
    expect(mockHandleWalletRegistration).toHaveBeenCalledTimes(1);
    expect(mockEncrypt).not.toHaveBeenCalled();
    expect(localStorage.getItem("encrypted_wallet")).toBeNull();
    expect(localStorage.getItem("wallet_address")).toBeNull();
    expect(mockSetWalletAddress).not.toHaveBeenCalled();
  });

  it("deduplicates rapid PIN confirmation submissions while local wallet is being encrypted", async () => {
    let finishEncryption!: () => void;
    mockEncrypt.mockReturnValue(
      new Promise<string>((resolve) => {
        finishEncryption = () => resolve("encrypted-wallet-json");
      })
    );

    render(<RegisterWallet />);

    await completeMnemonicStep();
    const firstPinPad = await screen.findByTestId("pin-pad");
    await act(async () => {
      fireEvent.click(firstPinPad);
    });

    const confirmPinPad = await screen.findByTestId("pin-pad");
    await act(async () => {
      fireEvent.click(confirmPinPad);
    });

    await waitFor(() => {
      expect(mockEncrypt).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      fireEvent.click(confirmPinPad);
    });

    expect(mockEncrypt).toHaveBeenCalledTimes(1);
    expect(mockHandleWalletRegistration).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishEncryption();
    });

    await waitFor(() => {
      expect(mockEncrypt).toHaveBeenCalledTimes(1);
    });
    expect(localStorage.getItem("encrypted_wallet")).toBe(
      "encrypted-wallet-json"
    );
  });

  it("deduplicates rapid mnemonic registration submissions", async () => {
    let finishRegistration!: () => void;
    mockHandleWalletRegistration.mockReturnValue(
      new Promise((resolve) => {
        finishRegistration = () => resolve(buildRegistered());
      })
    );

    render(<RegisterWallet />);

    fireEvent.click(screen.getByRole("button", { name: "paste mnemonic" }));
    const submitButton = screen.getByRole("button", {
      name: "submit mnemonic",
    });

    await act(async () => {
      fireEvent.click(submitButton);
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockHandleWalletRegistration).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      finishRegistration();
    });
  });
});
