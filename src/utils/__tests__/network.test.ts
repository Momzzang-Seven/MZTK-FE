import { afterEach, describe, expect, it, vi } from "vitest";
import { getWalletRegistrationEip712Domain } from "../network";

const OPT_TOKEN_ADDRESS = "0x815B53fD2D56044BaC39c1f7a9C7d3E67322f0F5";
const BASE_TOKEN_ADDRESS = "0xfd6c0dc7fbe6a200d53d00bbaa2a276d02865de8";
const CUSTOM_VERIFYING_CONTRACT = "0x1111111111111111111111111111111111111111";

describe("network utils", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("falls back to the Optimism EIP-712 domain used by wallet registration", () => {
    vi.stubEnv("VITE_OPT_SEPOLIA_CHAIN_ID", "11155420");
    vi.stubEnv("VITE_OPT_SEPOLIA_TOKEN_ADDRESS", OPT_TOKEN_ADDRESS);
    vi.stubEnv("VITE_WEB3_EIP712_DOMAIN_NAME", "");
    vi.stubEnv("VITE_WEB3_EIP712_DOMAIN_VERSION", "");
    vi.stubEnv("VITE_BASE_SEPOLIA_CHAIN_ID", "84532");
    vi.stubEnv("VITE_BASE_SEPOLIA_TOKEN_ADDRESS", BASE_TOKEN_ADDRESS);

    expect(getWalletRegistrationEip712Domain()).toEqual({
      name: "MomzzangSeven",
      version: "1",
      chainId: 84532,
      verifyingContract: BASE_TOKEN_ADDRESS,
    });
  });

  it("uses explicit backend EIP-712 env values when they are provided", () => {
    vi.stubEnv("VITE_OPT_SEPOLIA_CHAIN_ID", "11155420");
    vi.stubEnv("VITE_OPT_SEPOLIA_TOKEN_ADDRESS", OPT_TOKEN_ADDRESS);
    vi.stubEnv("VITE_WEB3_EIP712_DOMAIN_NAME", "MZTKCustom");
    vi.stubEnv("VITE_WEB3_EIP712_DOMAIN_VERSION", "2");
    vi.stubEnv("VITE_WEB3_EIP712_CHAIN_ID", "84532");
    vi.stubEnv(
      "VITE_WEB3_EIP712_VERIFYING_CONTRACT",
      CUSTOM_VERIFYING_CONTRACT
    );
    vi.stubEnv("VITE_BASE_SEPOLIA_CHAIN_ID", "84532");
    vi.stubEnv("VITE_BASE_SEPOLIA_TOKEN_ADDRESS", BASE_TOKEN_ADDRESS);

    expect(getWalletRegistrationEip712Domain()).toEqual({
      name: "MZTKCustom",
      version: "2",
      chainId: 84532,
      verifyingContract: BASE_TOKEN_ADDRESS,
    });
  });
});
