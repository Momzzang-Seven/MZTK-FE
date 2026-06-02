import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@store";
import { ethers } from "ethers";
import { getNetworkConfig } from "@utils/network";
import { fetchTokenTransfers, isTokenTransferRateLimitError } from "@services";

interface TokenTx {
  hash: string;
  timeStamp: string;
  to: string;
  from: string;
  value: string;
}

type TokenHistoryError = "rate-limit" | "unknown";

const MyTknHistory = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [logs, setLogs] = useState<TokenTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<TokenHistoryError | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const { NAME } = getNetworkConfig();

  useEffect(() => {
    if (!user?.walletAddress) {
      setLogs([]);
      setLoadError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    let cancelled = false;

    fetchTokenTransfers(user.walletAddress, 50)
      .then((data) => {
        if (!cancelled) {
          setLogs(data);
          setLoadError(null);
        }
      })
      .catch((err) => {
        const isRateLimited = isTokenTransferRateLimitError(err);

        if (import.meta.env.DEV && !isRateLimited) {
          console.error("History fetch error:", err);
        }

        if (!cancelled) {
          setLogs([]);
          setLoadError(isRateLimited ? "rate-limit" : "unknown");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.walletAddress, reloadNonce]);

  return (
    <div className="flex flex-col min-h-dvh bg-[#FDFDFD] pb-20">
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
            {NAME}
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
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
            <div className="w-16 h-16 rounded-[22px] bg-orange-50 flex items-center justify-center text-main">
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
                <path d="M12 8v5" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] text-gray-900 font-black">
                거래 내역을 불러오지 못했습니다
              </p>
              <p className="text-[13px] text-gray-400 font-bold mt-1 leading-relaxed">
                {loadError === "rate-limit"
                  ? "요청이 많아 잠시 후 다시 시도해주세요."
                  : "네트워크 상태를 확인하고 다시 시도해주세요."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReloadNonce((value) => value + 1)}
              className="btn-press px-5 py-3 bg-main text-white rounded-[18px] font-black text-[13px] shadow-lg shadow-main/20 border-none"
            >
              다시 시도
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
