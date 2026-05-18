import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MZTK_ABI } from "@abi";
import { walletService, web3Service } from "@services";
import { useWalletService } from "../useWalletService";
import type { Web3Execution } from "@types";

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
const AUTH_SIGNATURE = `0x${"bb".repeat(65)}`;
const SUBMIT_SIGNATURE = `0x${"cc".repeat(65)}`;

const createWeb3Intent = (
  overrides: Partial<Web3Execution> = {}
): Web3Execution => ({
  resource: {
    type: "QUESTION",
    id: "post-1",
    status: "PENDING_EXECUTION",
  },
  actionType: "QNA_QUESTION_CREATE",
  executionIntent: {
    id: "intent-1",
    status: "AWAITING_SIGNATURE",
    expiresAt: "2026-05-13T00:00:00Z",
  },
  execution: {
    mode: "EIP7702",
    signCount: 2,
  },
  signRequest: {
    authorization: {
      chainId: 11155420,
      delegateTarget: "0x3333333333333333333333333333333333333333",
      authorityNonce: 1,
      payloadHashToSign: "0x1111",
    },
    submit: {
      executionDigest: "0x2222",
      deadlineEpochSeconds: 1770000000,
    },
    transaction: {
      chainId: 11155420,
      fromAddress: WALLET_ADDRESS,
      toAddress: "0x4444444444444444444444444444444444444444",
      valueHex: "0x0",
      data: "0x1234",
      nonce: 1,
      gasLimitHex: "0x5208",
      maxPriorityFeePerGasHex: "0x1",
      maxFeePerGasHex: "0x2",
      expectedNonce: 1,
    },
  },
  ...overrides,
});

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

  it("sends complete EIP-7702 signatures for QnA web3 execution", async () => {
    vi.mocked(web3Service.executeWeb3Transaction).mockResolvedValue(undefined);
    const wallet = {
      signMessage: vi
        .fn()
        .mockResolvedValueOnce(AUTH_SIGNATURE)
        .mockResolvedValueOnce(SUBMIT_SIGNATURE),
    };
    const intent = createWeb3Intent();

    const { result } = renderHook(() => useWalletService());

    await act(async () => {
      await result.current.handleWeb3Signature(
        "intent-1",
        wallet as unknown as Parameters<
          typeof result.current.handleWeb3Signature
        >[1],
        intent
      );
    });

    expect(wallet.signMessage).toHaveBeenNthCalledWith(1, "0x1111");
    expect(wallet.signMessage).toHaveBeenNthCalledWith(2, "0x2222");
    expect(web3Service.executeWeb3Transaction).toHaveBeenCalledWith(
      "intent-1",
      {
        authorizationSignature: AUTH_SIGNATURE,
        submitSignature: SUBMIT_SIGNATURE,
      }
    );
  });

  it("does not execute web3 when the sign request is incomplete", async () => {
    const wallet = {
      signMessage: vi.fn(),
    };
    const intent = createWeb3Intent({
      signRequest: {
        ...createWeb3Intent().signRequest,
        authorization: {
          ...createWeb3Intent().signRequest.authorization,
          payloadHashToSign: "",
        },
      },
    });
    const { result } = renderHook(() => useWalletService());
    let thrownError: unknown;

    await act(async () => {
      try {
        await result.current.handleWeb3Signature(
          "intent-1",
          wallet as unknown as Parameters<
            typeof result.current.handleWeb3Signature
          >[1],
          intent
        );
      } catch (error) {
        thrownError = error;
      }
    });

    expect(thrownError).toBeInstanceOf(Error);
    expect(wallet.signMessage).not.toHaveBeenCalled();
    expect(web3Service.executeWeb3Transaction).not.toHaveBeenCalled();
    expect(result.current.error).toBe(
      "Web3 서명 요청 정보가 올바르지 않습니다. 잠시 후 다시 시도해 주세요."
    );
  });
});
