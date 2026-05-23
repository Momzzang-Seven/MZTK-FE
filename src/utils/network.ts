export const BASE_NETWORK_NAME = "Base Sepolia";

export const getNetworkConfig = () => {
  return {
    RPC_URL: import.meta.env.VITE_BASE_SEPOLIA_RPC,
    CHAIN_ID: Number(import.meta.env.VITE_BASE_SEPOLIA_CHAIN_ID),
    TOKEN_ADDRESS: import.meta.env.VITE_BASE_SEPOLIA_TOKEN_ADDRESS,
    // Etherscan V2: single endpoint, network distinguished by chainid param
    ETHERSCAN_URL: import.meta.env.VITE_ETHERSCAN_API_URL as string,
    EXPLORER_TX_URL: "https://sepolia.basescan.org/tx/",
    NAME: BASE_NETWORK_NAME,
  };
};

export const getWalletRegistrationEip712Domain = () => {
  const networkConfig = getNetworkConfig();

  return {
    name: import.meta.env.VITE_WEB3_EIP712_DOMAIN_NAME || "MomzzangSeven",
    version: import.meta.env.VITE_WEB3_EIP712_DOMAIN_VERSION || "1",
    chainId: networkConfig.CHAIN_ID,
    verifyingContract: networkConfig.TOKEN_ADDRESS,
  };
};
