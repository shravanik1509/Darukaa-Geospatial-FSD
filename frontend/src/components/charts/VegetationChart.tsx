import React from "react";
import { Line } from "react-chartjs-2";
import { AnalyticsRecord } from "../../types/analytics";
import { formatDate } from "../../utils/formatters";

interface VegetationChartProps {
  records: AnalyticsRecord[];
  height?: number;
}

export const VegetationChart: React.FC<VegetationChartProps> = ({ records, height = 300 }) => {
  if (!records || records.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
        <p className="text-sm">No historical vegetation measurements available.</p>
      </div>
    );
  }

  const sorted = [...records].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  const labels = sorted.map((r) => formatDate(r.recorded_at));
  const ndviPoints = sorted.map((r) => r.vegetation_value);
  const canopyPoints = sorted.map((r) => r.canopy_cover_percentage ?? null);

  const data = {
    labels,
    datasets: [
      {
        label: "Vegetation Index (NDVI)",
        data: ndviPoints,
        borderColor: "#a855f7",
        backgroundColor: "rgba(168, 85, 247, 0.15)",
        yAxisID: "yNDVI",
        fill: false,
        tension: 0.35,
        pointBackgroundColor: "#c084fc",
        borderWidth: 2.5,
      },
      {
        label: "Canopy Cover (%)",
        data: canopyPoints,
        borderColor: "#eab308",
        backgroundColor: "rgba(234, 179, 8, 0.15)",
        yAxisID: "yCanopy",
        fill: false,
        tension: 0.35,
        pointBackgroundColor: "#fde047",
        borderWidth: 2,
        borderDash: [5, 5],
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
        borderColor: "#1e293b",
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: { color: "#94a3b8", font: { size: 11 } },
      },
      yNDVI: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        min: 0,
        max: 1.0,
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: { color: "#c084fc", font: { size: 11 } },
        title: { display: true, text: "NDVI Index", color: "#c084fc", font: { size: 11 } },
      },
      yCanopy: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        min: 0,
        max: 100,
        grid: { drawOnChartArea: false },
        ticks: { color: "#fde047", font: { size: 11 } },
        title: { display: true, text: "Canopy Cover %", color: "#fde047", font: { size: 11 } },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
};
