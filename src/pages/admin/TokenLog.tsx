import { useEffect, useState, useMemo } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { AdminSearchBar } from "@components/admin/common/AdminSearchBar";

interface TokenLogItem {
  id: string;
  desc: string;
  value: string;
  to: string;
  timeStamp: string;
}

const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;
const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;
const ETHERSCAN_API_URL = import.meta.env.VITE_ETHERSCAN_API_URL;
const CHAIN_ID = import.meta.env.VITE_CHAIN_ID;

const TokenLog = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<TokenLogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, REWARD, SETTLEMENT

  useEffect(() => {
    fetch(
      `${ETHERSCAN_API_URL}?chainid=${CHAIN_ID}&module=account&action=tokentx&contractaddress=${TOKEN_ADDRESS}&page=1&offset=100&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "1") setLogs(data.result);
      });
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const amount = Number(ethers.formatUnits(log.value, 18));
      const matchesSearch = log.to.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesFilter = true;
      if (filterType === "REWARD") matchesFilter = amount <= 100;
      else if (filterType === "SETTLEMENT") matchesFilter = amount > 100;

      return matchesSearch && matchesFilter;
    });
  }, [logs, searchQuery, filterType]);

  return (
    <div className="p-10 space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-100 text-gray-400 hover:text-main hover:border-main transition-all shadow-sm"
        >
          ←
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          MZTK 지급 내역 상세
        </h2>
      </div>

      {/* 검색 및 필터 바 */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
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

      <div className="bg-white rounded-[32px] border border-gray-100 p-8 space-y-4 shadow-sm">
        <div className="flex justify-between items-center mb-2 px-2 text-sm text-gray-400 font-medium">
          <span>총 {filteredLogs.length}건의 기록</span>
          <span>최근 순서대로 정렬됨</span>
        </div>

        <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((tx, i) => {
              const amount = Number(ethers.formatUnits(tx.value, 18));
              const isSettlement = amount > 100;
              return (
                <div
                  key={i}
                  className="flex justify-between items-center p-6 bg-gray-50/50 rounded-[20px] border border-transparent hover:border-main/20 hover:bg-white transition-all group"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isSettlement ? "bg-blue-500" : "bg-main"}`}></span>
                      <p className="font-bold text-gray-800 break-all text-[15px]">
                        {tx.to}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded-md border ${isSettlement
                        ? "text-blue-600 bg-blue-50 border-blue-100"
                        : "text-main bg-orange-50 border-orange-100"
                        }`}>
                        {isSettlement ? "트레이너 정산" : "사용자 보상"}
                      </span>
                      <span className="text-[12px] text-gray-300">
                        {new Date(Number(tx.timeStamp) * 1000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-black text-xl tracking-tight ${isSettlement ? "text-blue-600" : "text-main"}`}>
                      +{amount.toLocaleString()}
                    </span>
                    <span className="ml-1 text-sm font-bold text-gray-400">MZTK</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-24 text-center flex flex-col items-center gap-3 bg-gray-50/30 rounded-2xl">
              <div className="text-4xl opacity-20">🔍</div>
              <p className="text-gray-400 font-medium">검색 결과가 없습니다.</p>
              <button
                onClick={() => { setSearchQuery(""); setFilterType("ALL"); }}
                className="text-xs text-main font-bold underline mt-2"
              >
                필터 초기화하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenLog;
