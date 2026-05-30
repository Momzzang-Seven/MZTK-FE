import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
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
  showSnackbar: vi.fn(),
  openConfirm: vi.fn(),
  fetchSponsorNonceSlots: vi.fn(),
}));

vi.mock("@store", () => ({
  useAdminStore: () => ({
    confirmTransaction: mocks.confirmTransaction,
    treasuryKeys: [],
    fetchTreasuryKeys: mocks.fetchTreasuryKeys,
    disableKey: mocks.disableKey,
    archiveKey: mocks.archiveKey,
    provisionKey: mocks.provisionKey,
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
    });

    expect(await screen.findByText("Nonce #7")).toBeInTheDocument();
    expect(screen.getByText("DB TX #10")).toBeInTheDocument();
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

    const roleSelect = screen.getByRole("combobox");
    const optionValues = within(roleSelect)
      .getAllByRole("option")
      .map((option) => (option as HTMLOptionElement).value);

    expect(optionValues).toEqual([
      "REWARD",
      "SPONSOR",
      "QNA_SIGNER",
      "MARKETPLACE_SIGNER",
    ]);
  });
});
