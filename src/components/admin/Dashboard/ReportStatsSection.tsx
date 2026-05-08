import { Pie } from "react-chartjs-2";
import { type TooltipItem } from "chart.js";

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
        formatter: (value: number) => string;
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
    <div className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col h-[400px]">
      <h4 className="font-bold text-gray-800 mb-6">게시물 삭제 통계</h4>
      <div className="flex-1 w-full flex items-center justify-center">
        {hasNoData ? (
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-2xl grayscale opacity-50">
              📊
            </div>
            <div>
              <p className="text-gray-500 font-bold">
                삭제된 게시물이 없습니다.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                깨끗한 커뮤니티가 유지되고 있어요!
              </p>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-[400px] h-[300px]">
            <Pie data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportStatsSection;
