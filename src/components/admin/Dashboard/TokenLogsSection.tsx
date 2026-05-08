import { CommonButton } from "@components/common";
import { History, ArrowUpRight, Inbox } from "lucide-react";

interface TokenLogItem {
  id: string;
  desc: string;
  amount: string;
}
interface TokenLogsSectionProps {
  tokenLogs: TokenLogItem[];
  loading: boolean;
  onViewAll: () => void;
}

const TokenLogsSection = ({
  tokenLogs,
  loading,
  onViewAll,
}: TokenLogsSectionProps) => (
  <div className="bg-white p-8 rounded-[28px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col h-[480px]">
    <div className="flex justify-between items-start mb-8">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-main uppercase tracking-[0.2em]">
          Activity Stream
        </span>
        <h4 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <History size={18} className="text-gray-400" />
          MZTK 지급 기록
        </h4>
      </div>
      <button
        onClick={onViewAll}
        className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-[11px] font-black tracking-widest hover:bg-main transition-colors shadow-lg shadow-gray-200"
      >
        VIEW ALL
      </button>
    </div>

    <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
          <div className="w-8 h-8 border-2 border-main border-t-transparent rounded-full animate-spin" />
          <p className="text-[12px] font-bold text-gray-400">
            Fetching logs...
          </p>
        </div>
      ) : tokenLogs.length > 0 ? (
        tokenLogs.map((log, i) => (
          <div
            key={i}
            className="flex justify-between items-center p-4 bg-gray-50/50 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-2xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-main shadow-sm">
                <ArrowUpRight size={18} />
              </div>
              <div className="flex flex-col">
                <p className="font-black text-[13px] text-gray-900 leading-tight">
                  {log.id}
                </p>
                <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                  {log.desc}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-gray-900 font-black text-[15px] tabular-nums">
                {log.amount}
              </span>
              <span className="text-[9px] font-black text-main uppercase tracking-widest">
                Success
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-[24px] flex items-center justify-center text-gray-300">
            <Inbox size={32} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[14px] font-black text-gray-400">
              기록이 없습니다.
            </p>
            <p className="text-[11px] font-bold text-gray-300 mt-1 uppercase tracking-tight">
              System is up to date
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default TokenLogsSection;
