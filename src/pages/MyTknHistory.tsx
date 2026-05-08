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
  const { user, selectedNetwork } = useUserStore();
  const [logs, setLogs] = useState<TokenTx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.walletAddress) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;

    // 네트워크별 설정 선택
    const isBase = selectedNetwork === "BASE";
    const TOKEN_ADDRESS = isBase
      ? import.meta.env.VITE_BASE_SEPOLIA_TOKEN_ADDRESS
      : import.meta.env.VITE_OPT_SEPOLIA_TOKEN_ADDRESS;

    // Etherscan API URL은 현재 Optimism용으로 고정되어 있을 수 있으므로 환경변수 확인
    // 실제 운영 시에는 네트워크별 API URL이 필요함
    const ETHERSCAN_API_URL = isBase
      ? "https://api-sepolia.basescan.org/api"
      : "https://api-sepolia-optimistic.etherscan.io/api";

    const CHAIN_ID = isBase
      ? import.meta.env.VITE_BASE_SEPOLIA_CHAIN_ID
      : import.meta.env.VITE_OPT_SEPOLIA_CHAIN_ID;

    fetch(
      `${ETHERSCAN_API_URL}?module=account&action=tokentx&contractaddress=${TOKEN_ADDRESS}&address=${user.walletAddress}&page=1&offset=50&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "1") {
          setLogs(data.result);
        } else {
          setLogs([]);
        }
      })
      .catch((err) => {
        console.error("History fetch error:", err);
      })
      .finally(() => setLoading(false));
  }, [user?.walletAddress, selectedNetwork]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] pb-20">
      {/* ── Header ── */}
      <div className="relative pt-12 pb-6 px-6 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-main opacity-[0.07] blur-[60px] rounded-full pointer-events-none" />
        <button
          onClick={() => navigate(-1)}
          className="btn-press mb-5 w-10 h-10 rounded-xl bg-white shadow-md shadow-gray-100 flex items-center justify-center border-none"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111827"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-black tracking-widest uppercase mb-1">
              Transaction
            </p>
            <h1 className="text-gray-900 text-2xl font-black tracking-tight">
              토큰 거래 내역
            </h1>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-100 text-[11px] font-black text-main">
            {selectedNetwork === "OPT" ? "Optimism" : "Base"}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-5 flex flex-col gap-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-4 border-main/20 border-t-main rounded-full animate-spin" />
            <p className="text-[13px] text-gray-400 font-bold tracking-tight">
              블록체인 내역을 불러오는 중...
            </p>
          </div>
        ) : !user?.walletAddress ? (
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-xl shadow-gray-100/50 p-8 flex flex-col items-center text-center gap-5 mt-4">
            <div className="w-16 h-16 rounded-[22px] bg-orange-50 flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FAB12F"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4Z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-900 font-black text-[17px]">
                지갑 정보가 없습니다
              </p>
              <p className="text-gray-400 text-[13px] font-bold mt-1 leading-relaxed">
                토큰 내역을 확인하려면
                <br />
                먼저 지갑을 등록해주세요.
              </p>
            </div>
            <button
              onClick={() => navigate("/register-wallet")}
              className="btn-press w-full py-4 bg-main text-white rounded-[20px] font-black text-[15px] shadow-xl shadow-main/25 border-none"
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
                className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 flex items-center justify-between animate-fade-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                      isReceive
                        ? "bg-amber-50 text-main"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    {isReceive ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 17V3" />
                        <polyline points="6 11 12 17 18 11" />
                        <path d="M19 21H5" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 12 7-7 7 7" />
                        <path d="M12 19V5" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-900 font-black text-[14px]">
                        {isReceive ? "보상 수령" : "토큰 송금"}
                      </p>
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                          isReceive
                            ? "bg-main/10 text-main"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {isReceive ? "REWARD" : "TRANSFER"}
                      </span>
                    </div>
                    <p className="text-gray-400 text-[11px] font-bold mt-0.5">
                      {new Date(Number(tx.timeStamp) * 1000).toLocaleString(
                        "ko-KR",
                        {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-[18px] font-black tracking-tight leading-none ${
                      isReceive ? "text-main" : "text-gray-900"
                    }`}
                  >
                    {isReceive ? "+" : "-"}
                    {amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-black text-gray-300 mt-1 uppercase tracking-widest">
                    MZTK
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 rounded-[22px] bg-gray-50 flex items-center justify-center text-gray-200">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              </svg>
            </div>
            <p className="text-[13px] text-gray-400 font-bold">
              거래 내역이 없습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTknHistory;
