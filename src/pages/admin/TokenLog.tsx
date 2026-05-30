import { useEffect, useState, useMemo } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { AdminSearchBar } from "@components/admin/common/AdminSearchBar";
import {
  ChevronLeft,
  Coins,
  Clock,
  ArrowUpRight,
  SearchX,
  RefreshCcw,
  LayoutList,
} from "lucide-react";
import { getNetworkConfig } from "@utils";
import { fetchTokenTransfers } from "@services";

interface TokenLogItem {
  hash: string;
  to: string;
  from: string;
  value: string;
  timeStamp: string;
  tokenSymbol: string;
  tokenDecimal: string;
}

const TokenLog = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<TokenLogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const { EXPLORER_TX_URL } = getNetworkConfig();
  const MONITOR_ADDRESS =
    import.meta.env.VITE_MONITOR_TARGET_ADDRESS ||
    import.meta.env.VITE_ADMIN_ADDRESS;

  useEffect(() => {
    if (!MONITOR_ADDRESS) return;
    let cancelled = false;

    fetchTokenTransfers(MONITOR_ADDRESS, 100)
      .then((data) => {
        if (!cancelled) setLogs(data);
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [MONITOR_ADDRESS]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const decimals = Number(log.tokenDecimal) || 18;
      const amount = Number(ethers.formatUnits(log.value, decimals));
      const matchesSearch =
        log.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.hash.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesFilter = true;
      if (filterType === "REWARD") matchesFilter = amount <= 100;
      else if (filterType === "SETTLEMENT") matchesFilter = amount > 100;

      return matchesSearch && matchesFilter;
    });
  }, [logs, searchQuery, filterType]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-200 transition-all shadow-sm group"
          >
            <ChevronLeft
              size={20}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </button>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Transaction Ledger
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              MZTK 지급 내역 상세
            </h2>
          </div>
        </div>

        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Total Volume
            </span>
            <span className="text-xl font-black text-gray-900 tabular-nums">
              {filteredLogs.length} Records
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-main shadow-inner">
            <LayoutList size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[28px] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-gray-100">
        <AdminSearchBar
          placeholder="수령인 주소로 검색하세요 (0x...)"
          onSearch={setSearchQuery}
          filterOptions={[
            { label: "전체 내역", value: "ALL" },
            { label: "사용자 보상 (출석/레벨업)", value: "REWARD" },
            { label: "트레이너 정산 (클래스 대금)", value: "SETTLEMENT" },
          ]}
          currentFilter={filterType}
          onFilterChange={setFilterType}
        />
      </div>

      <div className="bg-white rounded-[28px] border border-gray-100 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col h-[640px]">
        <div className="flex justify-between items-center mb-8 px-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              Live Chain Data
            </span>
          </div>
          <span className="text-[11px] font-bold text-gray-300 uppercase tracking-tighter italic">
            Last 100 Transactions
          </span>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((tx, i) => {
              const amount = Number(ethers.formatUnits(tx.value, 18));
              const isSettlement = amount > 100;
              return (
                <div
                  key={i}
                  className="flex justify-between items-center p-6 bg-gray-50/50 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-[24px] transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${
                        isSettlement
                          ? "bg-blue-500 text-white shadow-blue-100"
                          : "bg-main text-white shadow-orange-100"
                      }`}
                    >
                      {isSettlement ? (
                        <RefreshCcw size={20} strokeWidth={2.5} />
                      ) : (
                        <Coins size={20} strokeWidth={2.5} />
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-gray-900 text-[13px] leading-none tracking-tight font-mono">
                          {tx.to.slice(0, 10)}...{tx.to.slice(-8)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-md border tracking-widest uppercase ${
                            isSettlement
                              ? "text-blue-600 bg-blue-50/50 border-blue-100"
                              : "text-main bg-orange-50/50 border-orange-100"
                          }`}
                        >
                          {isSettlement ? "SETTLEMENT" : "REWARD"}
                        </span>
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Clock size={12} />
                          <span className="text-[11px] font-bold tabular-nums">
                            {new Date(
                              Number(tx.timeStamp) * 1000
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span
                          className={`font-black text-2xl tracking-tighter tabular-nums ${isSettlement ? "text-blue-600" : "text-main"}`}
                        >
                          +{amount.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-black text-gray-400 mt-1">
                          {tx.tokenSymbol || "MZTK"}
                        </span>
                      </div>
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                        Confirmed
                      </span>
                    </div>
                    <a
                      href={`${EXPLORER_TX_URL}${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-gray-900 hover:border-gray-200 transition-all"
                    >
                      <ArrowUpRight size={18} strokeWidth={2.5} />
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-6 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200 shadow-inner">
                <SearchX size={40} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg font-black text-gray-400">
                  검색 결과가 없습니다.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterType("ALL");
                  }}
                  className="text-xs text-main font-black underline mt-2 tracking-widest uppercase hover:text-sub transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenLog;
