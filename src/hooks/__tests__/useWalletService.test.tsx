import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MZTK_ABI } from "@abi";
import { walletService } from "@services";
import { useWalletService } from "../useWalletService";

const ethersMocks = vi.hoisted(() => ({
  approve: vi.fn(),
  contract: vi.fn(),
  jsonRpcProvider: vi.fn(),
}));

vi.mock("@abi", () => ({
  MZTK_ABI: [["mztk-abi"]],
}));

vi.mock("@services", () => ({
  walletService: {
    createChallenge: vi.fn(),
    registerWallet: vi.fn(),
    unlinkWallet: vi.fn(),
  },
  web3Service: {
    executeWeb3Transaction: vi.fn(),
  },
}));

vi.mock("ethers", () => ({
  getBytes: vi.fn((value: string) => value),
  ethers: {
    JsonRpcProvider: ethersMocks.jsonRpcProvider,
    Contract: ethersMocks.contract,
    MaxUint256: BigInt(
      "115792089237316195423570985008687907853269984665640564039457584007913129639935"
    ),
  },
}));

const WALLET_ADDRESS = "0x2222222222222222222222222222222222222222";
const OPT_TOKEN_ADDRESS = "0x815B53fD2D56044BaC39c1f7a9C7d3E67322f0F5";
const BASE_TOKEN_ADDRESS = "0xfd6c0dc7fbe6a200d53d00bbaa2a276d02865de8";
const SIGNATURE = `0x${"aa".repeat(65)}`;

describe("useWalletService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_OPT_SEPOLIA_RPC", "https://opt.example");
    vi.stubEnv("VITE_OPT_SEPOLIA_CHAIN_ID", "11155420");
    vi.stubEnv("VITE_OPT_SEPOLIA_TOKEN_ADDRESS", OPT_TOKEN_ADDRESS);
    vi.stubEnv("VITE_BASE_SEPOLIA_RPC", "https://base.example");
    vi.stubEnv("VITE_BASE_SEPOLIA_CHAIN_ID", "84532");
    vi.stubEnv("VITE_BASE_SEPOLIA_TOKEN_ADDRESS", BASE_TOKEN_ADDRESS);
    vi.stubEnv("VITE_WEB3_EIP712_CHAIN_ID", "");
    vi.stubEnv("VITE_WEB3_EIP712_VERIFYING_CONTRACT", "");

    ethersMocks.jsonRpcProvider.mockImplementation(function JsonRpcProvider() {
      return {};
    });
    ethersMocks.approve.mockResolvedValue({
      wait: vi.fn().mockResolvedValue(undefined),
    });
    ethersMocks.contract.mockImplementation(function Contract() {
      return {
        approve: ethersMocks.approve,
      };
    });

    vi.mocked(walletService.createChallenge).mockResolvedValue({
      nonce: "nonce-1",
      message: "Register this wallet",
      expiresIn: 300,
    });
    vi.mocked(walletService.registerWallet).mockResolvedValue({
      id: 1,
      walletAddress: WALLET_ADDRESS,
      registeredAt: "2026-05-13T00:00:00Z",
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("signs wallet registration with the backend EIP-712 domain", async () => {
    const wallet = {
      address: WALLET_ADDRESS,
      connect: vi.fn(),
      signTypedData: vi.fn().mockResolvedValue(SIGNATURE),
    };
    wallet.connect.mockReturnValue(wallet);

    const { result } = renderHook(() => useWalletService());

    await act(async () => {
      await result.current.handleWalletRegistration(
        wallet as unknown as Parameters<
          typeof result.current.handleWalletRegistration
        >[0],
        "BASE"
      );
    });

    expect(wallet.signTypedData).toHaveBeenCalledWith(
      {
        name: "MomzzangSeven",
        version: "1",
        chainId: 11155420,
        verifyingContract: OPT_TOKEN_ADDRESS,
      },
      {
        AuthRequest: [
          { name: "content", type: "string" },
          { name: "nonce", type: "string" },
        ],
      },
      {
        content: "Register this wallet",
        nonce: "nonce-1",
      }
    );
    expect(walletService.registerWallet).toHaveBeenCalledWith({
      walletAddress: WALLET_ADDRESS,
      signature: SIGNATURE,
      nonce: "nonce-1",
    });
    expect(ethersMocks.contract).toHaveBeenCalledWith(
      BASE_TOKEN_ADDRESS,
      MZTK_ABI[0],
      wallet
    );
  });
});
