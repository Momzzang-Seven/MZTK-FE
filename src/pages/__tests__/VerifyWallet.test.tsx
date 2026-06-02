import type { ReactNode } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VerifyWallet from "../VerifyWallet";
import type { Web3Execution } from "@types";

const mockNavigate = vi.hoisted(() => vi.fn());
const mockHandleWeb3Signature = vi.hoisted(() => vi.fn());
const mockRecoverCreate = vi.hoisted(() => vi.fn());
const mockGetIncompletedPostTransaction = vi.hoisted(() => vi.fn());
const mockSetWalletError = vi.hoisted(() => vi.fn());
const mockSetPostError = vi.hoisted(() => vi.fn());
const mockFromEncryptedJson = vi.hoisted(() => vi.fn());
const mockLocationState = vi.hoisted<{ intent?: Web3Execution }>(() => ({}));
const mockWallet = vi.hoisted(() => ({ address: "0x123" }));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: mockLocationState }),
  useParams: () => ({ type: "question", id: "321" }),
}));

vi.mock("ethers", () => ({
  ethers: {
    Wallet: {
      fromEncryptedJson: mockFromEncryptedJson,
    },
  },
}));

vi.mock("@hooks", () => ({
  useWalletService: () => ({
    loading: false,
    error: null,
    setError: mockSetWalletError,
    handleWeb3Signature: mockHandleWeb3Signature,
  }),
  usePostService: () => ({
    isPostLoading: false,
    error: null,
    setError: mockSetPostError,
    recoverCreate: mockRecoverCreate,
    getIncompletedPostTransaction: mockGetIncompletedPostTransaction,
  }),
}));

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

vi.mock("@components/auth/PinPad", () => ({
  PinPad: ({
    desc,
    onInput,
  }: {
    desc?: ReactNode;
    onInput: (value: string) => void;
  }) => (
    <>
      <p>{desc}</p>
      <button
        type="button"
        onClick={() => {
          for (const value of ["1", "2", "3", "4", "5", "6"]) {
            onInput(value);
          }
        }}
      >
        enter pin
      </button>
    </>
  ),
}));

vi.mock("@components/wallet/WalletSuccessSection", () => ({
  WalletSuccessSection: ({
    title,
    onConfirm,
  }: {
    title?: ReactNode;
    onConfirm: () => void;
  }) => (
    <div data-testid="wallet-success-section">
      <h2>{title}</h2>
      <button type="button" onClick={onConfirm}>
        confirm
      </button>
    </div>
  ),
}));

const buildIntent = (
  overrides: Partial<Web3Execution> = {}
): Web3Execution => ({
  resource: {
    type: "QUESTION",
    id: "321",
    status: "PENDING_EXECUTION",
  },
  actionType: "QNA_QUESTION_CREATE",
  executionIntent: {
    id: "intent-1",
    status: "PENDING_ONCHAIN",
    expiresAt: "2026-05-23T10:05:00",
  },
  execution: {
    mode: "EIP7702",
    signCount: 2,
  },
  signRequest: null,
  transaction: {
    id: 1001,
    status: "UNCONFIRMED",
    txHash:
      "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
  },
  ...overrides,
});

describe("VerifyWallet", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockFromEncryptedJson.mockResolvedValue(mockWallet);
    mockLocationState.intent = buildIntent();
    mockGetIncompletedPostTransaction.mockImplementation(
      async () => mockLocationState.intent
    );
    localStorage.setItem("encrypted_wallet", "encrypted-wallet-json");
  });

  it("blocks QnA web3 signing when receipt timeout recovery is uncertain", async () => {
    mockLocationState.intent = buildIntent({
      recoveryStatus: "ONCHAIN_UNCERTAIN",
      recoveryReason: "RECEIPT_TIMEOUT",
      retryAllowed: false,
    });

    render(<VerifyWallet />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "enter pin" }));
    });

    expect(await screen.findByRole("dialog")).toHaveTextContent(
      "블록체인 확인 지연"
    );
    await waitFor(() => {
      expect(mockHandleWeb3Signature).not.toHaveBeenCalled();
    });
    expect(mockRecoverCreate).not.toHaveBeenCalled();
  });

  it("shows the success title based on actionType", async () => {
    mockLocationState.intent = buildIntent({
      actionType: "QNA_ANSWER_ACCEPT",
    });

    render(<VerifyWallet />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "enter pin" }));
    });

    expect(
      await screen.findByRole("heading", {
        name: "답변 채택 요청이 완료되었어요",
      })
    ).toBeInTheDocument();
  });

  it("shows the PIN description based on actionType", () => {
    mockLocationState.intent = buildIntent({
      actionType: "QNA_ANSWER_ACCEPT",
    });

    render(<VerifyWallet />);

    expect(
      screen.getByText(/답변 채택 및 보상 지급을 위해/)
    ).toBeInTheDocument();
  });

  it.each(["AUTH_EXPIRED", "EIP7702_DEADLINE_TOO_CLOSE"] as const)(
    "asks the user to re-accept when the sign request is unavailable: %s",
    async (signRequestUnavailableReason) => {
      const staleIntent = buildIntent({
        actionType: "QNA_ANSWER_ACCEPT",
        signRequest: null,
        signRequestUnavailableReason,
        transaction: null,
      });
      mockLocationState.intent = staleIntent;
      mockGetIncompletedPostTransaction.mockResolvedValue(staleIntent);

      render(<VerifyWallet />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "enter pin" }));
      });

      expect(mockGetIncompletedPostTransaction).toHaveBeenCalledWith(
        "intent-1"
      );
      expect(await screen.findByRole("dialog")).toHaveTextContent(
        "서명 정보 만료"
      );
      expect(mockHandleWeb3Signature).not.toHaveBeenCalled();
    }
  );
});
