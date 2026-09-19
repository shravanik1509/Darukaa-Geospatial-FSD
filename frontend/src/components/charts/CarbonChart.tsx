import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { AnalyticsRecord } from "../../types/analytics";
import { formatDate } from "../../utils/formatters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CarbonChartProps {
  records: AnalyticsRecord[];
  height?: number;
}

export const CarbonChart: React.FC<CarbonChartProps> = ({ records, height = 300 }) => {
  if (!records || records.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
        <p className="text-sm">No historical carbon measurements recorded yet.</p>
      </div>
    );
  }

  // Sort chronologically
  const sorted = [...records].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  const labels = sorted.map((r) => formatDate(r.recorded_at));
  const dataPoints = sorted.map((r) => r.carbon_value);

  const data = {
    labels,
    datasets: [
      {
        label: "Carbon Stock (tCO2e/ha)",
        data: dataPoints,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#4ade80",
        pointBorderColor: "#14532d",
        pointHoverRadius: 6,
        borderWidth: 2.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#cbd5e1",
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#4ade80",
        borderColor: "#1e293b",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => ` ${context.dataset.label}: ${context.parsed.y} tCO2e/ha`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: { color: "#94a3b8", font: { size: 11 } },
      },
      y: {
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: { color: "#94a3b8", font: { size: 11 } },
        title: {
          display: true,
          text: "Tonnes CO2e / Hectare",
          color: "#64748b",
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
};
