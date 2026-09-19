import React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card } from "../common/Card";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  changePercentage?: number | null;
  changeLabel?: string;
  icon: React.ReactNode;
  variant?: "brand" | "blue" | "purple" | "amber";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  changePercentage,
  changeLabel = "vs prior record",
  icon,
  variant = "brand",
}) => {
  const iconVariants = {
    brand: "bg-brand-500/10 text-brand-400 border-brand-500/20",
    blue: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  const renderTrend = () => {
    if (changePercentage === null || changePercentage === undefined) return null;

    if (changePercentage > 0) {
      return (
        <div className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
          <ArrowUpRight className="w-3.5 h-3.5" />
          +{changePercentage}%
          <span className="text-slate-500 font-normal ml-1">{changeLabel}</span>
        </div>
      );
    }
    if (changePercentage < 0) {
      return (
        <div className="inline-flex items-center gap-1 text-rose-400 text-xs font-semibold">
          <ArrowDownRight className="w-3.5 h-3.5" />
          {changePercentage}%
          <span className="text-slate-500 font-normal ml-1">{changeLabel}</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1 text-slate-400 text-xs font-semibold">
        <Minus className="w-3.5 h-3.5" />
        0%
        <span className="text-slate-500 font-normal ml-1">{changeLabel}</span>
      </div>
    );
  };

  return (
    <Card hoverEffect className="flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2 rounded-xl border ${iconVariants[variant]}`}>{icon}</div>
      </div>

      <div className="mt-4 mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {value}
          </span>
          {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-800/60">{renderTrend()}</div>
    </Card>
  );
};
