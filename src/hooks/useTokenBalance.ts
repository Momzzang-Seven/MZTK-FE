import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { MZTK_ABI } from "@abi";
import { useUserStore } from "@store";
import { getNetworkConfig } from "@utils";

const ERC20_ABI = MZTK_ABI[0];

export const useTokenBalance = () => {
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(true);

  const { selectedNetwork } = useUserStore();
  const { TOKEN_ADDRESS, RPC_URL } = getNetworkConfig();
  const USER_ADDRESS = localStorage.getItem("wallet_address");

  useEffect(() => {
    let isMounted = true;

    const fetchBalance = async () => {
      if (!USER_ADDRESS || !TOKEN_ADDRESS) {
        setLoading(false);
        return;
      }

      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(
          TOKEN_ADDRESS,
          ERC20_ABI,
          provider
        );

        const [rawBalance, decimals] = await Promise.all([
          contract.balanceOf(USER_ADDRESS),
          contract.decimals(),
        ]);

        if (isMounted) {
          setBalance(ethers.formatUnits(rawBalance, decimals));
        }
      } catch (error) {
        console.error("잔액 조회 실패:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void fetchBalance();
    return () => {
      isMounted = false;
    };
  }, [USER_ADDRESS, TOKEN_ADDRESS, RPC_URL, selectedNetwork]);

  return { balance, loading, USER_ADDRESS };
};
