import { REGISTER_WALLET_STORAGE_KEYS } from "@constant/registerWallet";

export const clearLocalWalletStorage = () => {
  localStorage.removeItem(REGISTER_WALLET_STORAGE_KEYS.walletAddress);
  localStorage.removeItem(REGISTER_WALLET_STORAGE_KEYS.encryptedWallet);
};

export const syncLocalWalletStorage = (walletAddress?: string | null) => {
  const normalizedAddress = walletAddress?.trim();

  if (!normalizedAddress) {
    clearLocalWalletStorage();
    return;
  }

  const currentAddress = localStorage.getItem(
    REGISTER_WALLET_STORAGE_KEYS.walletAddress
  );
  const isSameLocalWallet =
    currentAddress?.toLowerCase() === normalizedAddress.toLowerCase();

  if (!isSameLocalWallet) {
    localStorage.removeItem(REGISTER_WALLET_STORAGE_KEYS.encryptedWallet);
  }

  localStorage.setItem(
    REGISTER_WALLET_STORAGE_KEYS.walletAddress,
    normalizedAddress
  );
};
