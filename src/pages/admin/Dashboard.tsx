import SummaryCard from "@components/admin/Dashboard/SummaryCard";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useNavigate } from "react-router-dom";
import { useAdminDashboardData } from "@hooks";
import { getChartData, getChartOptions } from "@utils";
import ReportStatsSection from "@components/admin/Dashboard/ReportStatsSection";
import TokenLogsSection from "@components/admin/Dashboard/TokenLogsSection";
import { Server, Coins, Users, Wallet, RefreshCw } from "lucide-react";
import { useAdminStore } from "@store";
import { ADMIN_TEXT } from "@constant/admin";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { selectedChainId } = useAdminStore();
  const { tokenLogs, ethBalance, mztkBalance, userStats, postStats, loading } =
    useAdminDashboardData();
  const chartData = getChartData(postStats);
  const chartOptions = getChartOptions();

  const isOpt = selectedChainId === "11155420";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with Network Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Management Console
          </span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {ADMIN_TEXT.ACCOUNTS.TITLE}
          </h2>
        </div>

        {/* Network Status Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-2xl border flex items-center gap-2 transition-all duration-300 ${
              isOpt
                ? "bg-red-50/50 border-red-100 text-red-600 shadow-[0_4px_12px_rgba(239,68,68,0.08)]"
                : "bg-blue-50/50 border-blue-100 text-blue-600 shadow-[0_4px_12px_rgba(59,130,246,0.08)]"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOpt ? "bg-red-500" : "bg-blue-500"}`}
            />
            <span className="text-[11px] font-black tracking-widest uppercase">
              {isOpt ? "Optimism Sepolia" : "Base Sepolia"}
            </span>
          </div>
          {loading && (
            <RefreshCw size={14} className="text-gray-300 animate-spin" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <SummaryCard
          title="Server Status"
          value="Online"
          subValue="Running"
          variant="amber"
          icon={Server}
        />
        <SummaryCard
          title="ETH Balance"
          value={loading ? ADMIN_TEXT.COMMON.LOADING : `${ethBalance} ETH`}
          subValue={isOpt ? "Optimism Sepolia" : "Base Sepolia"}
          variant="blue"
          icon={Wallet}
        />
        <SummaryCard
          title="MZTK Balance"
          value={loading ? ADMIN_TEXT.COMMON.LOADING : `${mztkBalance} MZTK`}
          subValue={isOpt ? "Optimism Sepolia" : "Base Sepolia"}
          variant="amber"
          icon={Coins}
        />
        <SummaryCard
          title={ADMIN_TEXT.USER.TABLE.ACTIVITY}
          value={
            loading
              ? ADMIN_TEXT.COMMON.LOADING
              : userStats
                ? userStats.activeUserCount.toLocaleString()
                : "0"
          }
          subValue={
            userStats
              ? `${ADMIN_TEXT.COMMON.FILTER.BANNED} \ud68c\uc6d0: ${userStats.blockedUserCount}\uba85`
              : `${ADMIN_TEXT.COMMON.FILTER.BANNED} \ud68c\uc6d0: 0\uba85`
          }
          variant="zinc"
          icon={Users}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TokenLogsSection
          tokenLogs={tokenLogs}
          loading={loading}
          onViewAll={() => navigate("/admin/token-logs")}
        />
        <ReportStatsSection chartData={chartData} chartOptions={chartOptions} />
      </div>
    </div>
  );
};

export default AdminDashboard;
