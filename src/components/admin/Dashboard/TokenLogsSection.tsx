import { CommonButton } from "@components/common";

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
  <div className="bg-white p-6 rounded-2xl border border-gray-100">
    <div className="flex justify-between items-center mb-6">
      <h4 className="font-bold text-gray-800">MZTK 지급 기록</h4>
      <CommonButton
        label="전체 보기"
        img="/icon/eye.svg"
        width="w-fit"
        className="text-xs px-3 py-1 bg-main text-white rounded-full font-bold hover:bg-sub"
        onClick={onViewAll}
      />
    </div>
    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-400">
          데이터 로딩 중...
        </div>
      ) : tokenLogs.length > 0 ? (
        tokenLogs.map((log, i) => (
          <div
            key={i}
            className="flex justify-between items-center p-4 bg-gray-50 rounded-xl animate-fadeIn"
          >
            <div>
              <p className="font-bold text-sm text-gray-800">{log.id}</p>
              <p className="text-xs text-gray-500">{log.desc}</p>
            </div>
            <span className="text-main font-bold text-sm">{log.amount}</span>
          </div>
        ))
      ) : (
        <div className="text-center py-20 text-gray-400">기록이 없습니다.</div>
      )}
    </div>
  </div>
);

export default TokenLogsSection;
