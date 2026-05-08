import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@store";
import { ethers } from "ethers";

interface TokenTx {
  id: string;
  timeStamp: string;
  to: string;
  from: string;
  value: string;
  tokenName: string;
}

const MyTknHistory = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [logs, setLogs] = useState<TokenTx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If wallet address is missing, stop loading and return
    if (!user?.walletAddress) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;
    const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;
    const ETHERSCAN_API_URL = import.meta.env.VITE_ETHERSCAN_API_URL;
    const CHAIN_ID = import.meta.env.VITE_CHAIN_ID;

    // Fetch user's token transactions
    fetch(
      `${ETHERSCAN_API_URL}?chainid=${CHAIN_ID}&module=account&action=tokentx&contractaddress=${TOKEN_ADDRESS}&address=${user.walletAddress}&page=1&offset=50&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "1") {
          setLogs(data.result);
        }
      })
      .catch((err) => {
        console.error("History fetch error:", err);
      })
      .finally(() => setLoading(false));
  }, [user?.walletAddress]);

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-4 h-16 bg-white border-b border-gray-100 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-gray-400"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <span className="text-lg font-bold text-gray-900 ml-1">
          토큰 거래 내역
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
            <div className="w-6 h-6 border-2 border-main border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">내역을 불러오는 중...</span>
          </div>
        ) : !user?.walletAddress ? (
          <div className="flex flex-col items-center justify-center text-gray-400 gap-4 px-10 text-center">
            <div className="text-5xl opacity-20">👛</div>
            <p className="text-sm font-medium leading-relaxed">
              연결된 지갑 주소가 없습니다.
              <br />
              마이페이지에서 지갑을 먼저 등록해 주세요.
            </p>
            <button
              onClick={() => navigate("/register-wallet")}
              className="mt-2 px-6 py-2 bg-main text-white rounded-full font-bold text-sm shadow-md"
            >
              지갑 등록하러 가기
            </button>
          </div>
        ) : logs.length > 0 ? (
          logs.map((tx, i) => {
            const amount = Number(ethers.formatUnits(tx.value, 18));
            const isReceive =
              tx.to.toLowerCase() === user?.walletAddress?.toLowerCase();

            return (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center"
              >
                <div className="flex flex-col gap-1">
                  <span
                    className={`text-[11px] font-black w-fit px-2 py-0.5 rounded-md ${
                      isReceive
                        ? "text-main bg-orange-50"
                        : "text-gray-500 bg-gray-50"
                    }`}
                  >
                    {isReceive ? "보상 수령" : "토큰 송금"}
                  </span>
                  <span className="text-sm font-bold text-gray-800 tracking-tight">
                    {isReceive ? "MZTK Reward" : "Wallet Transfer"}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(Number(tx.timeStamp) * 1000).toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-black tracking-tighter ${
                      isReceive ? "text-main" : "text-gray-900"
                    }`}
                  >
                    {isReceive ? "+" : "-"}
                    {amount.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-bold text-gray-300">
                    MZTK
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-300 gap-3">
            <div className="text-5xl opacity-20">📜</div>
            <p className="text-sm font-medium">거래 내역이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTknHistory;
