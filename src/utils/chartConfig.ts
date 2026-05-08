import { type TooltipItem } from "chart.js";
import type { PostStatsResponse } from "@types";

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
    hoverOffset: number;
    borderWidth: number;
  }[];
}

interface ChartOptions {
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
}

export const getChartData = (
  postStats?: PostStatsResponse | null
): ChartData => {
  const defaultData: ChartData = {
    labels: ["데이터 없음"],
    datasets: [
      {
        data: [100],
        backgroundColor: ["#E5E7EB"],
        hoverOffset: 0,
        borderWidth: 0,
      },
    ],
  };

  if (!postStats || !postStats.postRemovalReasonStats) {
    return defaultData;
  }

  const reasonMap: Record<string, string> = {
    INAPPROPRIATE: "부적절한 콘텐츠",
    SPAM: "스팸/홍보",
    HARASSMENT: "욕설/비하",
    POLICY_VIOLATION: "정책 위반",
    OTHER: "기타",
  };

  const reasons = postStats.postRemovalReasonStats;

  // Filter out zero values and map to Korean labels
  const filteredEntries = Object.entries(reasons)
    .filter(([key, value]) => value > 0 && key)
    .map(([key, value]) => ({
      label: reasonMap[key] || key,
      value: value,
    }));

  if (filteredEntries.length === 0) {
    return defaultData;
  }

  const labels = filteredEntries.map((e) => e.label);
  const data = filteredEntries.map((e) => e.value);
  const backgroundColors = [
    "#FF8A00",
    "#FFD600",
    "#4BC0C0",
    "#FF6384",
    "#36A2EB",
  ];

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: backgroundColors.slice(0, data.length),
        hoverOffset: 8,
        borderWidth: 0,
      },
    ],
  };
};

export const getChartOptions = (): ChartOptions => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    datalabels: {
      color: "#fff",
      font: { weight: "bold" as const, size: 18 },
      formatter: (value: number, context: unknown) => {
        const ctx = context as {
          chart: { data: { datasets: { data: number[] }[] } };
        };
        const dataArr = ctx.chart.data.datasets[0].data;
        const total = dataArr.reduce((a: number, b: number) => a + b, 0);
        if (total === 0) return "0%";
        return `${Math.round((value / total) * 100)}%`;
      },
      anchor: "center" as const,
      align: "center" as const,
    },
    legend: {
      position: "right" as const,
      labels: { boxWidth: 20, padding: 15 },
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<"pie">) => {
          let label = context.label || "";
          if (label) label += ": ";
          if (context.parsed !== null) label += `${context.parsed}%`;
          return label;
        },
      },
    },
  },
});
