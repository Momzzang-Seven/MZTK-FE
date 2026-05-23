import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { walletService, web3Service } from "@services";
import { useWalletService } from "../useWalletService";
import type { RegisterWalletResponse, Web3Execution } from "@types";

const ethersMocks = vi.hoisted(() => ({
  jsonRpcProvider: vi.fn(),
  contract: vi.fn(),
  allowance: vi.fn(),
}));

vi.mock("@abi", () => ({
  MZTK_ABI: [["mztk-abi"]],
}));

vi.mock("@services", () => ({
  walletService: {
    createChallenge: vi.fn(),
    registerWallet: vi.fn(),
    unlinkWallet: vi.fn(),
    getWalletRegistrationStatus: vi.fn(),
    retryWalletApprovalIntent: vi.fn(),
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

const createRegistrationResponse = (
  overrides: Partial<RegisterWalletResponse> = {}
): RegisterWalletResponse => ({
  registrationId: "reg-1",
  status: "APPROVAL_REQUIRED",
  walletId: null,
  walletAddress: WALLET_ADDRESS,
  registeredAt: null,
  nextAction: "SIGN_APPROVAL",
  web3: createWeb3Intent({
    resource: {
      type: "WALLET_REGISTRATION",
      id: "reg-1",
      status: "PENDING_EXECUTION",
    },
    actionType: "WALLET_ESCROW_APPROVE",
  }),
  ...overrides,
});

describe("useWalletService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("VITE_BASE_SEPOLIA_RPC", "https://base.example");
    vi.stubEnv("VITE_BASE_SEPOLIA_CHAIN_ID", "84532");
    vi.stubEnv("VITE_BASE_SEPOLIA_TOKEN_ADDRESS", BASE_TOKEN_ADDRESS);

    ethersMocks.jsonRpcProvider.mockImplementation(function JsonRpcProvider() {
      return {};
    });
    ethersMocks.allowance.mockResolvedValue(BigInt(0));
    ethersMocks.contract.mockImplementation(function Contract() {
      return {
        allowance: ethersMocks.allowance,
      };
    });

    vi.mocked(walletService.createChallenge).mockResolvedValue({
      nonce: "nonce-1",
      message: "Register this wallet",
      expiresIn: 300,
    });
    vi.mocked(walletService.registerWallet).mockResolvedValue(
      createRegistrationResponse()
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("signs ownership message and returns the registration response without touching escrow approve", async () => {
    const wallet = {
      address: WALLET_ADDRESS,
      signTypedData: vi.fn().mockResolvedValue(SIGNATURE),
    };

    const { result } = renderHook(() => useWalletService());

    let response: RegisterWalletResponse | undefined;
    await act(async () => {
      response = await result.current.handleWalletRegistration(
        wallet as unknown as Parameters<
          typeof result.current.handleWalletRegistration
        >[0]
      );
    });

    expect(wallet.signTypedData).toHaveBeenCalledWith(
      {
        name: "MomzzangSeven",
        version: "1",
        chainId: 84532,
        verifyingContract: BASE_TOKEN_ADDRESS,
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
    expect(response?.registrationId).toBe("reg-1");
    expect(response?.nextAction).toBe("SIGN_APPROVAL");
    // EIP-7702로 escrow approve가 BE에서 처리되므로 FE에서 직접 호출하지 않는다.
    expect(ethersMocks.contract).not.toHaveBeenCalled();
  });

  it("propagates a backend error message when registration fails", async () => {
    vi.mocked(walletService.registerWallet).mockRejectedValue({
      response: { data: { message: "Challenge not found or expired" } },
    });
    const wallet = {
      address: WALLET_ADDRESS,
      signTypedData: vi.fn().mockResolvedValue(SIGNATURE),
    };

    const { result } = renderHook(() => useWalletService());

    let thrown: unknown;
    await act(async () => {
      try {
        await result.current.handleWalletRegistration(
          wallet as unknown as Parameters<
            typeof result.current.handleWalletRegistration
          >[0]
        );
      } catch (err) {
        thrown = err;
      }
    });

    expect(thrown).toBeDefined();
    expect(result.current.error).toBe("Challenge not found or expired");
  });

  it("sends complete EIP-7702 signatures for QnA web3 execution", async () => {
    vi.mocked(web3Service.executeWeb3Transaction).mockResolvedValue(undefined);
    const wallet = {
      authorize: vi.fn().mockResolvedValue({
        signature: { serialized: AUTH_SIGNATURE },
      }),
      signingKey: {
        sign: vi.fn().mockReturnValue({ serialized: SUBMIT_SIGNATURE }),
      },
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

    expect(wallet.authorize).toHaveBeenCalledWith({
      chainId: 11155420,
      address: "0x3333333333333333333333333333333333333333",
      nonce: 1,
    });
    expect(wallet.signingKey.sign).toHaveBeenCalledWith("0x2222");
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
    const baseIntent = createWeb3Intent();
    const intent = createWeb3Intent({
      signRequest: baseIntent.signRequest
        ? {
            ...baseIntent.signRequest,
            authorization: {
              ...baseIntent.signRequest.authorization,
              payloadHashToSign: "",
            },
          }
        : null,
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

  it("does not execute web3 when the sign request is null", async () => {
    const wallet = { signMessage: vi.fn() };
    const intent = createWeb3Intent({ signRequest: null });
    const { result } = renderHook(() => useWalletService());

    await act(async () => {
      try {
        await result.current.handleWeb3Signature(
          "intent-1",
          wallet as unknown as Parameters<
            typeof result.current.handleWeb3Signature
          >[1],
          intent
        );
      } catch {
        /* expected */
      }
    });

    expect(wallet.signMessage).not.toHaveBeenCalled();
    expect(web3Service.executeWeb3Transaction).not.toHaveBeenCalled();
  });
});
