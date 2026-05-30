import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreateWallet from "../CreateWallet";
import RestoreWallet from "../RestoreWallet";

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
const mockEncrypt = vi.hoisted(() => vi.fn());
const mockPinSequence = vi.hoisted(() => ({
  values: ["0", "0", "0", "0", "0", "0"],
}));
const mockWallet = vi.hoisted(() => ({
  address: "0x2222222222222222222222222222222222222222",
  mnemonic: { phrase: MNEMONIC_WORDS.join(" ") },
  encrypt: mockEncrypt,
}));
const mockHdNodeWallet = vi.hoisted(() => ({
  createRandom: vi.fn(() => mockWallet),
  fromPhrase: vi.fn(() => mockWallet),
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
  HDNodeWallet: mockHdNodeWallet,
  ethers: {
    HDNodeWallet: mockHdNodeWallet,
    Wallet: {
      fromEncryptedJson: vi.fn(),
    },
  },
}));

vi.mock("@store", () => ({
  useUserStore: vi.fn(<T,>(selector?: (state: unknown) => T) => {
    const state = {
      user: { walletAddress: mockWallet.address },
      setWalletAddress: mockSetWalletAddress,
    };
    return selector ? selector(state) : state;
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

vi.mock("@components/auth/MnemonicDisplay", () => ({
  MnemonicDisplay: ({ onNext }: { onNext: () => void }) => (
    <button type="button" onClick={onNext}>
      next mnemonic
    </button>
  ),
}));

vi.mock("@components/auth/MnemonicVerify", () => ({
  MnemonicVerify: ({
    onBulkChange,
    onVerify,
  }: {
    onBulkChange: (words: string[]) => void;
    onVerify: () => void;
  }) => (
    <div>
      <button type="button" onClick={() => onBulkChange(MNEMONIC_WORDS)}>
        paste mnemonic
      </button>
      <button type="button" onClick={onVerify}>
        verify mnemonic
      </button>
    </div>
  ),
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
  WalletSuccessSection: () => <div data-testid="wallet-success-section" />,
}));

describe("wallet PIN edge cases", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockEncrypt.mockResolvedValue("encrypted-wallet-json");
    mockPinSequence.values = ["0", "0", "0", "0", "0", "0"];
  });

  it("rejects weak PINs during wallet creation before local encryption", async () => {
    render(
      <MemoryRouter>
        <CreateWallet />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "next mnemonic" }));
    fireEvent.click(screen.getByRole("button", { name: "paste mnemonic" }));
    fireEvent.click(screen.getByRole("button", { name: "verify mnemonic" }));
    fireEvent.click(await screen.findByTestId("pin-pad"));

    expect(await screen.findByRole("dialog")).toHaveTextContent("Weak PIN");
    expect(mockEncrypt).not.toHaveBeenCalled();
    expect(localStorage.getItem("encrypted_wallet")).toBeNull();
  });

  it("rejects sequential PINs during wallet restoration before local encryption", async () => {
    mockPinSequence.values = ["1", "2", "3", "4", "5", "6"];

    render(
      <MemoryRouter>
        <RestoreWallet />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "paste mnemonic" }));
    fireEvent.click(screen.getByRole("button", { name: "submit mnemonic" }));

    await waitFor(() => {
      expect(screen.getByTestId("pin-pad")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("pin-pad"));

    expect(await screen.findByRole("dialog")).toHaveTextContent("Weak PIN");
    expect(mockEncrypt).not.toHaveBeenCalled();
    expect(localStorage.getItem("encrypted_wallet")).toBeNull();
  });

  it("deduplicates rapid PIN confirmation during wallet creation", async () => {
    let finishEncryption!: () => void;
    mockPinSequence.values = ["1", "3", "5", "7", "9", "0"];
    mockEncrypt.mockReturnValue(
      new Promise<string>((resolve) => {
        finishEncryption = () => resolve("encrypted-wallet-json");
      })
    );

    render(
      <MemoryRouter>
        <CreateWallet />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "next mnemonic" }));
    fireEvent.click(screen.getByRole("button", { name: "paste mnemonic" }));
    fireEvent.click(screen.getByRole("button", { name: "verify mnemonic" }));
    fireEvent.click(await screen.findByTestId("pin-pad"));

    const confirmPinPad = await screen.findByTestId("pin-pad");
    fireEvent.click(confirmPinPad);
    fireEvent.click(confirmPinPad);

    await waitFor(() => {
      expect(mockEncrypt).toHaveBeenCalledTimes(1);
    });

    finishEncryption();
    await waitFor(() => {
      expect(localStorage.getItem("encrypted_wallet")).toBe(
        "encrypted-wallet-json"
      );
    });
  });

  it("deduplicates rapid PIN confirmation during wallet restoration", async () => {
    let finishEncryption!: () => void;
    mockPinSequence.values = ["1", "3", "5", "7", "9", "0"];
    mockEncrypt.mockReturnValue(
      new Promise<string>((resolve) => {
        finishEncryption = () => resolve("encrypted-wallet-json");
      })
    );

    render(
      <MemoryRouter>
        <RestoreWallet />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "paste mnemonic" }));
    fireEvent.click(screen.getByRole("button", { name: "submit mnemonic" }));
    fireEvent.click(await screen.findByTestId("pin-pad"));

    const confirmPinPad = await screen.findByTestId("pin-pad");
    fireEvent.click(confirmPinPad);
    fireEvent.click(confirmPinPad);

    await waitFor(() => {
      expect(mockEncrypt).toHaveBeenCalledTimes(1);
    });

    finishEncryption();
    await waitFor(() => {
      expect(localStorage.getItem("encrypted_wallet")).toBe(
        "encrypted-wallet-json"
      );
    });
  });
});
