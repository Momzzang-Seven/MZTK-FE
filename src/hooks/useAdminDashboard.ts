import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

interface EtherscanTxItem {
  from: string;
  to: string;
  value: string;
  tokenName?: string;
  tokenSymbol?: string;
  timeStamp?: string;
  hash?: string;
}

interface TokenLogItem {
  id: string;
  desc: string;
  amount: string;
}

interface AdminDashboardData {
  tokenLogs: TokenLogItem[];
  ethBalance: string;
  mztkBalance: string;
  loading: boolean;
  error: string | null;
}

const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;
const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;
const ADMIN_WALLET_ADDRESS = import.meta.env.VITE_ADMIN_ADDRESS;
const ETHERSCAN_API_URL = import.meta.env.VITE_ETHERSCAN_API_URL;
const CHAIN_ID = import.meta.env.VITE_CHAIN_ID;

const formatTokenLog = (tx: EtherscanTxItem): TokenLogItem => ({
  id: `사용자 #${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`,
  desc:
    tx.from === "0x0000000000000000000000000000000000000000"
      ? "MZTK 발행(Mint)"
      : "MZTK 전송",
  amount: `+${Number(ethers.formatUnits(tx.value, 18)).toLocaleString()} MZTK`,
});

const formatEthBalance = (balance: string): string => {
  const formatted = ethers.formatEther(balance);
  return Number(formatted).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });
};

const formatMztkBalance = (balance: string): string => {
  const formatted = ethers.formatUnits(balance, 18);
  return Number(formatted).toLocaleString();
};

export const useAdminDashboardData = () => {
  const [data, setData] = useState<AdminDashboardData>({
    tokenLogs: [],
    ethBalance: "0",
    mztkBalance: "0",
    loading: true,
    error: null,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      const [txRes, ethRes, mztkRes] = await Promise.all([
        fetch(
          `${ETHERSCAN_API_URL}?chainid=${CHAIN_ID}&module=account&action=tokentx&contractaddress=${TOKEN_ADDRESS}&page=1&offset=6&sort=desc&apikey=${ETHERSCAN_API_KEY}`
        ),
        fetch(
          `${ETHERSCAN_API_URL}?chainid=${CHAIN_ID}&module=account&action=balance&address=${ADMIN_WALLET_ADDRESS}&apikey=${ETHERSCAN_API_KEY}`
        ),
        fetch(
          `${ETHERSCAN_API_URL}?chainid=${CHAIN_ID}&module=account&action=tokenbalance&contractaddress=${TOKEN_ADDRESS}&address=${ADMIN_WALLET_ADDRESS}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
        ),
      ]);

      const [txData, ethData, mztkData] = await Promise.all([
        txRes.json(),
        ethRes.json(),
        mztkRes.json(),
      ]);

      let tokenLogs: TokenLogItem[] = [];
      if (txData.status === "1" && Array.isArray(txData.result)) {
        tokenLogs = txData.result.map(formatTokenLog);
      }

      let ethBalance = "0";
      if (ethData.status === "1") {
        ethBalance = formatEthBalance(ethData.result);
      }

      let mztkBalance = "0";
      if (mztkData.status === "1") {
        mztkBalance = formatMztkBalance(mztkData.result);
      }

      setData({
        tokenLogs,
        ethBalance,
        mztkBalance,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("데이터 호출 중 오류 발생:", err);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: "데이터를 불러오는데 실패했습니다.",
      }));
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    tokenLogs: data.tokenLogs,
    ethBalance: data.ethBalance,
    mztkBalance: data.mztkBalance,
    loading: data.loading,
    error: data.error,
  };
};
