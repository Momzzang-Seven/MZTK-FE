import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import {
  fetchUserStats,
  fetchPostStats,
  fetchTokenTransfers,
  fetchWalletBalanceSnapshot,
} from "@services";
import type { OnchainTokenTransfer } from "@services";
import type { UserStatsResponse, PostStatsResponse } from "@types";

interface TokenLogItem {
  id: string;
  desc: string;
  amount: string;
}

interface AdminDashboardData {
  tokenLogs: TokenLogItem[];
  ethBalance: string;
  mztkBalance: string;
  userStats: UserStatsResponse | null;
  postStats: PostStatsResponse | null;
  loading: boolean;
  error: string | null;
}

const ADMIN_WALLET_ADDRESS = import.meta.env.VITE_ADMIN_ADDRESS;
const MONITOR_ADDRESS =
  import.meta.env.VITE_MONITOR_TARGET_ADDRESS || ADMIN_WALLET_ADDRESS;

const formatTokenLog = (tx: OnchainTokenTransfer): TokenLogItem => ({
  id: `User #${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`,
  desc:
    tx.from === "0x0000000000000000000000000000000000000000"
      ? "MZTK mint"
      : "MZTK transfer",
  amount: `+${Number(ethers.formatUnits(tx.value, 18)).toLocaleString()} MZTK`,
});

export const useAdminDashboardData = () => {
  const [data, setData] = useState<AdminDashboardData>({
    tokenLogs: [],
    ethBalance: "0",
    mztkBalance: "0",
    userStats: null,
    postStats: null,
    loading: true,
    error: null,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      const [tokenTransfers, balances, userStats, postStats] =
        await Promise.all([
          MONITOR_ADDRESS
            ? fetchTokenTransfers(MONITOR_ADDRESS, 6).catch((err) => {
                console.error("Token transfer fetch failed:", err);
                return [];
              })
            : Promise.resolve([]),
          ADMIN_WALLET_ADDRESS
            ? fetchWalletBalanceSnapshot(ADMIN_WALLET_ADDRESS).catch((err) => {
                console.error("Wallet balance fetch failed:", err);
                return { ethBalance: "0", tokenBalance: "0" };
              })
            : Promise.resolve({ ethBalance: "0", tokenBalance: "0" }),
          fetchUserStats().catch((err) => {
            console.error("User stats fetch failed:", err);
            return null;
          }),
          fetchPostStats().catch((err) => {
            console.error("Post stats fetch failed:", err);
            return null;
          }),
        ]);

      setData((prev) => ({
        tokenLogs:
          tokenTransfers.length > 0
            ? tokenTransfers.map(formatTokenLog)
            : prev.tokenLogs,
        ethBalance: balances.ethBalance,
        mztkBalance: balances.tokenBalance,
        userStats: userStats || prev.userStats,
        postStats: postStats || prev.postStats,
        loading: false,
        error: null,
      }));
    } catch (err) {
      console.error("Failed to fetch admin dashboard data:", err);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: "Failed to load dashboard data.",
      }));
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    tokenLogs: data.tokenLogs,
    ethBalance: data.ethBalance,
    mztkBalance: data.mztkBalance,
    userStats: data.userStats,
    postStats: data.postStats,
    loading: data.loading,
    error: data.error,
  };
};
