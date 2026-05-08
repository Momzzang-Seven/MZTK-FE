import SummaryCard from "@components/admin/Dashboard/SummaryCard";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useNavigate } from "react-router-dom";
import { useAdminDashboardData } from "@hooks";
import { getChartData, getChartOptions } from "@utils";
import ReportStatsSection from "@components/admin/Dashboard/ReportStatsSection";
import TokenLogsSection from "@components/admin/Dashboard/TokenLogsSection";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { tokenLogs, ethBalance, mztkBalance, userStats, postStats, loading } =
    useAdminDashboardData();
  const chartData = getChartData(postStats);
  const chartOptions = getChartOptions();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <SummaryCard
          title="서버 상태"
          value="온라인"
          subValue="● 정상 운영 중"
          iconBg="bg-main"
          icon="/icon/server.svg"
        />
        <SummaryCard
          title="ETH 잔액"
          value={loading ? "로딩 중..." : `${ethBalance} ETH`}
          iconBg="bg-blue-600"
          icon="/icon/ether.svg"
        />
        <SummaryCard
          title="MZTK 잔액"
          value={loading ? "로딩 중..." : `${mztkBalance} MZTK`}
          iconBg="bg-main"
          icon="/icon/adminToken.svg"
        />
        <SummaryCard
          title="활성 사용자"
          value={
            loading
              ? "로딩 중..."
              : userStats
                ? userStats.activeUserCount.toLocaleString()
                : "0"
          }
          subValue={
            userStats
              ? `BAN 사용자: ${userStats.blockedUserCount}명`
              : "BAN 사용자: 0명"
          }
          iconBg="bg-blue-600"
          icon="/icon/activeUser.svg"
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
