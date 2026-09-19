import React from "react";
import { Line } from "react-chartjs-2";
import { AnalyticsRecord } from "../../types/analytics";
import { formatDate } from "../../utils/formatters";

interface BiodiversityChartProps {
  records: AnalyticsRecord[];
  height?: number;
}

export const BiodiversityChart: React.FC<BiodiversityChartProps> = ({ records, height = 300 }) => {
  if (!records || records.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
        <p className="text-sm">No historical biodiversity records available.</p>
      </div>
    );
  }

  const sorted = [...records].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  const labels = sorted.map((r) => formatDate(r.recorded_at));
  const dataPoints = sorted.map((r) => r.biodiversity_value);

  const data = {
    labels,
    datasets: [
      {
        label: "Biodiversity Index (Shannon H')",
        data: dataPoints,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.15)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#0284c7",
        pointBorderColor: "#082f49",
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
        bodyColor: "#38bdf8",
        borderColor: "#1e293b",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) => ` ${context.dataset.label}: ${context.parsed.y} / 5.0`,
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
        min: 0,
        max: 5.0,
        title: {
          display: true,
          text: "Index Score (0.0 to 5.0)",
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
