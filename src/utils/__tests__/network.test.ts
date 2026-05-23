import { afterEach, describe, expect, it, vi } from "vitest";
import { getWalletRegistrationEip712Domain } from "../network";

const BASE_TOKEN_ADDRESS = "0xfd6c0dc7fbe6a200d53d00bbaa2a276d02865de8";

describe("network utils", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the Base EIP-712 domain used by wallet registration", () => {
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

  it("uses custom EIP-712 domain name and version when provided", () => {
    vi.stubEnv("VITE_WEB3_EIP712_DOMAIN_NAME", "MZTKCustom");
    vi.stubEnv("VITE_WEB3_EIP712_DOMAIN_VERSION", "2");
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
