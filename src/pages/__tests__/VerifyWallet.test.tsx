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
const mockRecoverMyReservationEscrow = vi.hoisted(() => vi.fn());
const mockRecoverTrainerReservationEscrow = vi.hoisted(() => vi.fn());
const mockGetIncompletedPostTransaction = vi.hoisted(() => vi.fn());
const mockSetWalletError = vi.hoisted(() => vi.fn());
const mockSetPostError = vi.hoisted(() => vi.fn());
const mockFromEncryptedJson = vi.hoisted(() => vi.fn());
const mockLocationState = vi.hoisted<{
  intent?: Web3Execution;
  recoveryScope?: "member" | "trainer";
  returnTo?: string;
}>(() => ({}));
const mockParams = vi.hoisted<{
  type?: string;
  id?: string;
  parentId?: string;
}>(() => ({ type: "question", id: "321" }));
const mockWallet = vi.hoisted(() => ({ address: "0x123" }));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: mockLocationState }),
  useParams: () => mockParams,
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

vi.mock("@services", () => ({
  recoverMyReservationEscrow: mockRecoverMyReservationEscrow,
  recoverTrainerReservationEscrow: mockRecoverTrainerReservationEscrow,
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

const buildMarketplaceIntent = (
  overrides: Partial<Web3Execution> = {}
): Web3Execution =>
  buildIntent({
    resource: {
      type: "MARKETPLACE_RESERVATION",
      id: "501",
      status: "PENDING_EXECUTION",
    },
    actionType: "MARKETPLACE_CLASS_PURCHASE",
    executionIntent: {
      id: "intent-501",
      status: "AWAITING_SIGNATURE",
      expiresAt: "2026-05-23T10:05:00",
    },
    transaction: null,
    ...overrides,
  });

const signRequest = {
  authorization: {
    chainId: 31337,
    delegateTarget: "0x0000000000000000000000000000000000000001",
    authorityNonce: 1,
    payloadHashToSign:
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  },
  submit: {
    executionDigest:
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    deadlineEpochSeconds: 1_780_000_000,
  },
  transaction: null,
};

describe("VerifyWallet", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockParams.type = "question";
    mockParams.id = "321";
    mockParams.parentId = undefined;
    mockFromEncryptedJson.mockResolvedValue(mockWallet);
    mockLocationState.intent = buildIntent();
    mockGetIncompletedPostTransaction.mockImplementation(
      async () => mockLocationState.intent
    );
    mockLocationState.recoveryScope = undefined;
    mockLocationState.returnTo = undefined;
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
    it("signs marketplace reservation intent through the generic Web3 execution API", async () => {
      const currentIntent = buildMarketplaceIntent();
      const signableIntent = buildMarketplaceIntent({
        signRequest,
        viewerCanExecute: true,
      });
      mockParams.type = "MARKETPLACE_RESERVATION";
      mockParams.id = "501";
      mockLocationState.intent = currentIntent;
      mockLocationState.recoveryScope = "member";
      mockLocationState.returnTo = "/market/reservations";
      mockGetIncompletedPostTransaction.mockResolvedValue(signableIntent);
      mockHandleWeb3Signature.mockResolvedValue(undefined);

      render(<VerifyWallet />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "enter pin" }));
      });

      await waitFor(() => {
        expect(mockGetIncompletedPostTransaction).toHaveBeenCalledWith(
          "intent-501"
        );
        expect(mockHandleWeb3Signature).toHaveBeenCalledWith(
          "intent-501",
          mockWallet,
          signableIntent
        );
      });

      fireEvent.click(await screen.findByRole("button", { name: "confirm" }));

      expect(mockNavigate).toHaveBeenCalledWith("/market/reservations");
    });

    it("recovers expired marketplace reservation intent with the member recovery API", async () => {
      const expiredIntent = buildMarketplaceIntent({
        executionIntent: {
          id: "intent-expired",
          status: "EXPIRED",
          expiresAt: "2026-05-23T10:05:00",
        },
      });
      const recoveredIntent = buildMarketplaceIntent({
        executionIntent: {
          id: "intent-recovered",
          status: "AWAITING_SIGNATURE",
          expiresAt: "2026-05-23T10:10:00",
        },
        signRequest,
      });
      mockParams.type = "MARKETPLACE_RESERVATION";
      mockParams.id = "501";
      mockLocationState.intent = expiredIntent;
      mockLocationState.recoveryScope = "member";
      mockGetIncompletedPostTransaction.mockResolvedValue(expiredIntent);
      mockRecoverMyReservationEscrow.mockResolvedValue({
        reservationId: 501,
        status: "PURCHASE_PREPARING",
        web3: recoveredIntent,
      });
      mockHandleWeb3Signature.mockResolvedValue(undefined);

      render(<VerifyWallet />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "enter pin" }));
      });

      await waitFor(() => {
        expect(mockRecoverMyReservationEscrow).toHaveBeenCalledWith(501);
        expect(mockRecoverTrainerReservationEscrow).not.toHaveBeenCalled();
        expect(mockRecoverCreate).not.toHaveBeenCalled();
        expect(mockHandleWeb3Signature).toHaveBeenCalledWith(
          "intent-recovered",
          mockWallet,
          recoveredIntent
        );
      });
    });
  });
});
