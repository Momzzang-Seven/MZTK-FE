import { Pie } from "react-chartjs-2";
import { type TooltipItem } from "chart.js";
import { BarChart3, ShieldCheck } from "lucide-react";

interface ReportStatsSectionProps {
  chartData: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      hoverOffset: number;
      borderWidth: number;
    }[];
  };
  chartOptions: {
    responsive: boolean;
    maintainAspectRatio: boolean;
    plugins: {
      datalabels: {
        color: string;
        font: { weight: "bold"; size: number };
        formatter: (value: number, context: unknown) => string;
        anchor: "center";
        align: "center";
      };
      legend: {
        position: "right";
        labels: { boxWidth: number; padding: number };
      };
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"pie">) => string;
        };
      };
    };
  };
}

const ReportStatsSection = ({
  chartData,
  chartOptions,
}: ReportStatsSectionProps) => {
  const hasNoData = chartData.labels[0] === "데이터 없음";

  return (
    <div className="bg-white p-8 rounded-[28px] border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col h-[480px]">
      <div className="flex flex-col gap-1 mb-8">
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
          Security Metrics
        </span>
        <h4 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <BarChart3 size={18} className="text-gray-400" />
          게시물 삭제 통계
        </h4>
      </div>

      <div className="flex-1 w-full flex items-center justify-center">
        {hasNoData ? (
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-50 rounded-[28px] flex items-center justify-center text-emerald-500 shadow-inner">
              <ShieldCheck size={36} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[15px] font-black text-gray-800">
                삭제된 게시물이 없습니다.
              </p>
              <p className="text-[11px] font-bold text-emerald-600/70 mt-1 uppercase tracking-widest">
                Community Health: Perfect
              </p>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-[400px] h-[300px] flex items-center justify-center">
            <Pie data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportStatsSection;
