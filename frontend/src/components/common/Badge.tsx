import React from "react";
import { ProjectStatus } from "../../types/project";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  const variantStyles = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    success: "bg-emerald-950/80 text-emerald-300 border-emerald-800/60",
    warning: "bg-amber-950/80 text-amber-300 border-amber-800/60",
    danger: "bg-rose-950/80 text-rose-300 border-rose-800/60",
    info: "bg-sky-950/80 text-sky-300 border-sky-800/60",
    purple: "bg-purple-950/80 text-purple-300 border-purple-800/60",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const ProjectStatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  switch (status) {
    case "Active":
      return <Badge variant="success">Active</Badge>;
    case "Planning":
      return <Badge variant="info">Planning</Badge>;
    case "Completed":
      return <Badge variant="purple">Completed</Badge>;
    case "Under Review":
      return <Badge variant="warning">Under Review</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};
