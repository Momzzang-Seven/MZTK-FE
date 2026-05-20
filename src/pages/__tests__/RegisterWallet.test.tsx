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
    selectedNetwork: "OPT" as const,
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
        for (const value of ["1", "2", "3", "4", "5", "6"]) {
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

const buildSignApproval = (): RegisterWalletResponse => ({
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
      id: "intent-1",
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

describe("RegisterWallet", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockEncrypt.mockResolvedValue("encrypted-wallet-json");
    mockHandleWalletRegistration.mockResolvedValue(buildRegistered());
    mockHandleUnlinkWallet.mockResolvedValue(undefined);
    mockHandleWeb3Signature.mockResolvedValue(undefined);
  });

  it("immediately routes to PIN setup when backend reports REGISTERED", async () => {
    render(<RegisterWallet />);

    await completeMnemonicStep();

    await waitFor(() => {
      expect(mockHandleWalletRegistration).toHaveBeenCalledWith(
        mockWallet,
        "OPT"
      );
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
      expect(mockEncrypt).toHaveBeenCalledWith("123456");
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
});
