import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_TEXT } from "@constant/admin";
import Web3Management from "../Web3Management";

const mocks = vi.hoisted(() => ({
  confirmTransaction: vi.fn(),
  fetchTreasuryKeys: vi.fn().mockResolvedValue(undefined),
  disableKey: vi.fn(),
  archiveKey: vi.fn(),
  provisionKey: vi.fn(),
  getMarketplaceRefundReview: vi.fn(),
  getMarketplaceSettlementReview: vi.fn(),
  executeMarketplaceRefund: vi.fn(),
  executeMarketplaceSettle: vi.fn(),
  showSnackbar: vi.fn(),
  openConfirm: vi.fn(),
  fetchSponsorNonceSlots: vi.fn(),
  fetchWeb3Transactions: vi.fn(),
}));

vi.mock("@store", () => ({
  useAdminStore: () => ({
    confirmTransaction: mocks.confirmTransaction,
    treasuryKeys: [],
    fetchTreasuryKeys: mocks.fetchTreasuryKeys,
    disableKey: mocks.disableKey,
    archiveKey: mocks.archiveKey,
    provisionKey: mocks.provisionKey,
    getMarketplaceRefundReview: mocks.getMarketplaceRefundReview,
    getMarketplaceSettlementReview: mocks.getMarketplaceSettlementReview,
    executeMarketplaceRefund: mocks.executeMarketplaceRefund,
    executeMarketplaceSettle: mocks.executeMarketplaceSettle,
  }),
  useUserStore: () => ({
    showSnackbar: mocks.showSnackbar,
  }),
  useConfirmModalStore: () => ({
    openConfirm: mocks.openConfirm,
  }),
}));

vi.mock("@services", () => ({
  fetchSponsorNonceSlots: mocks.fetchSponsorNonceSlots,
  fetchWeb3Transactions: mocks.fetchWeb3Transactions,
}));

vi.mock("@utils", () => ({
  getNetworkConfig: () => ({
    CHAIN_ID: 11155111,
    EXPLORER_TX_URL: "https://sepolia.etherscan.io/tx/",
    NAME: "Sepolia",
  }),
}));

vi.mock("@components/common", () => ({
  CommonButton: ({
    label,
    onClick,
    disabled,
    className,
  }: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button className={className} disabled={disabled} onClick={onClick}>
      {label}
    </button>
  ),
}));

describe("Web3Management QA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_MONITOR_TARGET_ADDRESS", "0xmonitor");
    mocks.fetchSponsorNonceSlots.mockResolvedValue({
      slots: [
        {
          nonce: 7,
          status: "PENDING",
          severity: "WARNING",
          blocking: false,
          activeTxId: 10,
          activeTxHash: "0xabc",
          updatedAt: "2026-05-29T00:00:00Z",
        },
      ],
    });
    mocks.fetchWeb3Transactions.mockResolvedValue({
      content: [
        {
          transactionId: 42,
          idempotencyKey: "idem-42",
          referenceType: "LEVEL_UP_REWARD",
          referenceId: "reward-42",
          txType: "EIP1559",
          fromUserId: null,
          toUserId: 7,
          fromAddress: "0xfrom",
          toAddress: "0xto",
          status: "PENDING",
          txHash: "0xabcdefabcdefabcdef",
          failureReason: null,
          processingBy: null,
          processingUntil: null,
          signedAt: null,
          broadcastedAt: null,
          confirmedAt: null,
          createdAt: "2026-05-29T00:00:00Z",
          updatedAt: "2026-05-29T00:01:00Z",
        },
      ],
      totalPages: 1,
      totalElements: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
      numberOfElements: 1,
      empty: false,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("loads treasury keys and wallet activity through BE admin APIs", async () => {
    render(<Web3Management />);

    await waitFor(() => {
      expect(mocks.fetchTreasuryKeys).toHaveBeenCalledTimes(1);
      expect(mocks.fetchSponsorNonceSlots).toHaveBeenCalledWith({
        chainId: 11155111,
        fromAddress: expect.any(String),
        page: 0,
        size: 10,
      });
      expect(mocks.fetchWeb3Transactions).toHaveBeenCalledWith({
        page: 0,
        size: 10,
      });
    });

    expect(await screen.findByText("Nonce #7")).toBeInTheDocument();
    expect(screen.getByText("DB TX #10")).toBeInTheDocument();
    expect(screen.getByText("DB TX #42")).toBeInTheDocument();
  });

  it("separates the backend DB transaction id from the on-chain tx hash", async () => {
    render(<Web3Management />);

    await screen.findByText("Nonce #7");
    expect(screen.getByText("DB Transaction ID")).toBeInTheDocument();
    expect(screen.getByText("On-chain TX Hash")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Internal DB id")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0x...")).toBeInTheDocument();
  });

  it("restricts treasury key roles to the BE-supported role enum values", async () => {
    render(<Web3Management />);

    await screen.findByText("Nonce #7");
    fireEvent.click(
      screen.getByRole("button", { name: ADMIN_TEXT.WEB3.TREASURY.BTN_ADD })
    );

    const roleSelect = screen
      .getAllByRole("combobox")
      .find((select) =>
        Array.from((select as HTMLSelectElement).options).some(
          (option) => option.value === "REWARD"
        )
      );
    expect(roleSelect).toBeDefined();

    const optionValues = Array.from(
      (roleSelect as HTMLSelectElement).options
    ).map((option) => option.value);

    expect(optionValues).toEqual([
      "REWARD",
      "SPONSOR",
      "QNA_SIGNER",
      "MARKETPLACE_SIGNER",
    ]);
  });

  it("loads marketplace reservation refund review and blocks non-processable execution", async () => {
    mocks.getMarketplaceRefundReview.mockResolvedValueOnce({
      reservationId: 44,
      processable: false,
      blockingReason: "Escrow is already settled.",
      reservationStatus: "SETTLED",
      escrowStatus: "SETTLED",
      adminExecutionPhase: "TERMINAL",
      baseValidationItems: [
        {
          code: "ALREADY_SETTLED",
          severity: "BLOCKING",
          message: "Reservation is terminal.",
          blocking: true,
        },
      ],
      reasonOptions: [
        {
          reasonCode: "ADMIN_MANUAL_REFUND",
          displayCode: "ADMIN_MANUAL_REFUND",
          processable: false,
          blockingCode: "ALREADY_SETTLED",
          requiresConfirmation: true,
          confirmationType: "MANUAL_REFUND",
          requiredAuthority: "MARKETPLACE_SIGNER",
          authoritySatisfied: true,
          resultPreview: null,
          validationItems: [],
        },
      ],
      activeExecution: null,
      lastAttempt: null,
    });

    render(<Web3Management />);

    fireEvent.change(screen.getByPlaceholderText("Reservation ID"), {
      target: { value: "44" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Load Review/ }));

    expect(
      await screen.findByText("Escrow is already settled.")
    ).toBeInTheDocument();
    expect(mocks.getMarketplaceRefundReview).toHaveBeenCalledWith(44);
    expect(
      screen.getByRole("button", { name: "Execute Refund" })
    ).toBeDisabled();
  });

  it("executes processable marketplace settlement with confirmation payload", async () => {
    mocks.getMarketplaceSettlementReview.mockResolvedValue({
      reservationId: 45,
      processable: true,
      blockingReason: null,
      reservationStatus: "APPROVED",
      escrowStatus: "LOCKED",
      adminExecutionPhase: "READY",
      baseValidationItems: [],
      reasonOptions: [
        {
          reasonCode: "ADMIN_MANUAL_SETTLE",
          displayCode: "ADMIN_MANUAL_SETTLE",
          processable: true,
          blockingCode: null,
          requiresConfirmation: true,
          confirmationType: "EARLY_SETTLE",
          requiredAuthority: "MARKETPLACE_SIGNER",
          authoritySatisfied: true,
          resultPreview: null,
          validationItems: [],
        },
      ],
      activeExecution: null,
      lastAttempt: null,
    });
    mocks.executeMarketplaceSettle.mockResolvedValueOnce({
      reservationId: 45,
      actionType: "MARKETPLACE_ADMIN_SETTLE",
      reservationStatus: "ADMIN_SETTLE_PENDING",
      escrowStatus: "ADMIN_SETTLE_PENDING",
      executionIntent: { status: "AWAITING_SIGNATURE" },
      existing: false,
    });

    render(<Web3Management />);

    fireEvent.change(screen.getByPlaceholderText("Reservation ID"), {
      target: { value: "45" },
    });
    fireEvent.change(screen.getByDisplayValue("Refund review"), {
      target: { value: "settlement" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Load Review/ }));

    expect(
      await screen.findByText("This reason is executable.")
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Execute Settlement" }));

    expect(mocks.openConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Execute Marketplace settlement",
        variant: "error",
      })
    );

    const confirmArg = mocks.openConfirm.mock.calls[0][0] as {
      onConfirm: () => Promise<void>;
    };
    await act(async () => {
      await confirmArg.onConfirm();
    });

    await waitFor(() => {
      expect(mocks.executeMarketplaceSettle).toHaveBeenCalledWith(45, {
        reasonCode: "ADMIN_MANUAL_SETTLE",
        memo: expect.any(String),
        confirmEarlySettle: true,
      });
    });
  });
});
