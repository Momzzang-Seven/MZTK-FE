import { useUserStore, type NetworkType } from "@store/userStore";

export const getNetworkConfig = (network?: NetworkType) => {
  const selectedNetwork = network || useUserStore.getState().selectedNetwork;
  const isBase = selectedNetwork === "BASE";

  return {
    RPC_URL: isBase
      ? import.meta.env.VITE_BASE_SEPOLIA_RPC
      : import.meta.env.VITE_OPT_SEPOLIA_RPC,
    CHAIN_ID: Number(
      isBase
        ? import.meta.env.VITE_BASE_SEPOLIA_CHAIN_ID
        : import.meta.env.VITE_OPT_SEPOLIA_CHAIN_ID
    ),
    TOKEN_ADDRESS: isBase
      ? import.meta.env.VITE_BASE_SEPOLIA_TOKEN_ADDRESS
      : import.meta.env.VITE_OPT_SEPOLIA_TOKEN_ADDRESS,
    // Etherscan V2: single endpoint, network distinguished by chainid param
    ETHERSCAN_URL: import.meta.env.VITE_ETHERSCAN_API_URL as string,
    // Block explorer tx link — still network-specific (browser URL, not API)
    EXPLORER_TX_URL: isBase
      ? "https://sepolia.basescan.org/tx/"
      : "https://sepolia-optimism.etherscan.io/tx/",
    NAME: isBase ? "Base Sepolia" : "Optimism Sepolia",
  };
};

export const getWalletRegistrationEip712Domain = (network?: NetworkType) => {
  const selectedNetwork = network || useUserStore.getState().selectedNetwork;

  const networkConfig = getNetworkConfig(selectedNetwork);

  return {
    name: import.meta.env.VITE_WEB3_EIP712_DOMAIN_NAME || "MomzzangSeven",
    version: import.meta.env.VITE_WEB3_EIP712_DOMAIN_VERSION || "1",
    chainId: networkConfig.CHAIN_ID,
    verifyingContract: networkConfig.TOKEN_ADDRESS,
  };
};
