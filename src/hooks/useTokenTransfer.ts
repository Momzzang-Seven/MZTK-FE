import { useState, useEffect, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { TOKEN_MESSAGES } from "@constant/token";
import { useUserStore } from "@store";
import { getNetworkConfig } from "@utils";

export const useTokenTransfer = () => {
  const [step, setStep] = useState<
    "MAIN" | "PIN_CHECK" | "SENDING" | "SUCCESS"
  >("MAIN");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [inputPin, setInputPin] = useState("");
  const [txHash, setTxHash] = useState("");
  const [errorModal, setErrorModal] = useState<string | null>(null);

  const { selectedNetwork } = useUserStore();
  const { RPC_URL, TOKEN_ADDRESS: MZT_ADDR } = getNetworkConfig();

  const isAmountValid = useMemo(() => {
    const numericAmount = Number(amount);
    return Boolean(
      amount &&
      !Number.isNaN(numericAmount) &&
      numericAmount > 0 &&
      numericAmount <= balance
    );
  }, [amount, balance]);

  const isAddressValid = useMemo(() => {
    if (!address) return false;
    try {
      return ethers.isAddress(
        address.startsWith("0x") ? address : `0x${address}`
      );
    } catch {
      return false;
    }
  }, [address]);

  const fetchBalance = useCallback(async () => {
    const userAddr = localStorage.getItem("wallet_address");
    if (!userAddr || !RPC_URL || !MZT_ADDR) return;
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const ABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
      ];
      const contract = new ethers.Contract(MZT_ADDR, ABI, provider);
      const [rawBalance, decimals] = await Promise.all([
        contract.balanceOf(userAddr),
        contract.decimals(),
      ]);
      setBalance(Number(ethers.formatUnits(rawBalance, decimals)));
    } catch (e) {
      console.error(TOKEN_MESSAGES.ERROR.FETCH_BALANCE_FAILED, e);
    }
  }, [RPC_URL, MZT_ADDR]);

  useEffect(() => {
    fetchBalance();
  }, [step, fetchBalance]);

  const handleTransfer = useCallback(
    async (pin: string) => {
      setStep("SENDING");
      try {
        const encryptedJson = localStorage.getItem("encrypted_wallet");
        if (!encryptedJson)
          throw new Error(TOKEN_MESSAGES.ERROR.WALLET_NOT_FOUND);
        if (!RPC_URL || !MZT_ADDR)
          throw new Error(TOKEN_MESSAGES.ERROR.CONFIG_MISSING);

        const wallet = await ethers.Wallet.fromEncryptedJson(
          encryptedJson,
          pin
        );
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const signer = wallet.connect(provider);
        const contract = new ethers.Contract(
          MZT_ADDR,
          ["function transfer(address to, uint256 amount) returns (bool)"],
          signer
        );

        const tx = await contract.transfer(
          address.startsWith("0x") ? address : `0x${address}`,
          ethers.parseUnits(amount, 18)
        );
        setTxHash(tx.hash);
        await tx.wait();
        setStep("SUCCESS");
      } catch {
        setErrorModal(TOKEN_MESSAGES.ERROR.TRANSFER_FAILED);
        setStep("MAIN");
      } finally {
        setInputPin("");
      }
    },
    [address, amount, RPC_URL, MZT_ADDR]
  );

  const resetForm = () => {
    setStep("MAIN");
    setAmount("");
    setAddress("");
    setTxHash("");
  };

  return {
    state: {
      step,
      address,
      amount,
      balance,
      inputPin,
      txHash,
      errorModal,
      isAmountValid,
      isAddressValid,
    },
    actions: {
      setStep,
      setAddress,
      setAmount,
      setInputPin,
      setErrorModal,
      handleTransfer,
      resetForm,
    },
  };
};
