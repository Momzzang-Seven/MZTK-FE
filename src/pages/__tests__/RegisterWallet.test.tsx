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
  }),
}));

vi.mock("@store", () => ({
  useUserStore: vi.fn(
    <T,>(
      selector: (state: { setWalletAddress: typeof mockSetWalletAddress }) => T
    ) => selector({ setWalletAddress: mockSetWalletAddress })
  ),
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
  PinPad: ({ onInput }: { onInput: (value: string) => void }) => (
    <button
      data-testid="pin-pad"
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
  WalletSuccessSection: ({ onConfirm }: { onConfirm: () => void }) => (
    <button type="button" onClick={onConfirm}>
      wallet success
    </button>
  ),
}));

const completeMnemonicStep = async () => {
  fireEvent.click(screen.getByRole("button", { name: "paste mnemonic" }));
  fireEvent.click(screen.getByRole("button", { name: "submit mnemonic" }));
  await screen.findByTestId("pin-pad");
};

const enterAndConfirmPin = async () => {
  const firstPinPad = await screen.findByTestId("pin-pad");
  await act(async () => {
    fireEvent.click(firstPinPad);
  });

  const secondPinPad = await screen.findByTestId("pin-pad");
  await act(async () => {
    fireEvent.click(secondPinPad);
  });
};

describe("RegisterWallet", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockEncrypt.mockResolvedValue("encrypted-wallet-json");
    mockHandleWalletRegistration.mockResolvedValue(undefined);
    mockHandleUnlinkWallet.mockResolvedValue(undefined);
  });

  it("persists encrypted wallet state only after backend registration succeeds", async () => {
    render(<RegisterWallet />);

    await completeMnemonicStep();
    await enterAndConfirmPin();

    await waitFor(() => {
      expect(mockHandleWalletRegistration).toHaveBeenCalledWith(mockWallet);
    });
    expect(mockEncrypt).toHaveBeenCalledWith("123456");
    expect(localStorage.getItem("encrypted_wallet")).toBe(
      "encrypted-wallet-json"
    );
    expect(localStorage.getItem("wallet_address")).toBe(WALLET_ADDRESS);
    expect(mockSetWalletAddress).toHaveBeenCalledWith(WALLET_ADDRESS);
    expect(
      await screen.findByRole("button", { name: "wallet success" })
    ).toBeInTheDocument();
  });

  it("does not persist local wallet state when backend registration fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockHandleWalletRegistration.mockRejectedValue(
      new Error("Invalid signature")
    );

    render(<RegisterWallet />);

    await completeMnemonicStep();
    await enterAndConfirmPin();

    await waitFor(() => {
      expect(mockHandleWalletRegistration).toHaveBeenCalledWith(mockWallet);
    });
    await waitFor(() => {
      expect(screen.getByTestId("pin-pad")).toBeInTheDocument();
    });
    expect(mockEncrypt).not.toHaveBeenCalled();
    expect(localStorage.getItem("encrypted_wallet")).toBeNull();
    expect(localStorage.getItem("wallet_address")).toBeNull();
    expect(mockSetWalletAddress).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Registration finalize error:",
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });
});
