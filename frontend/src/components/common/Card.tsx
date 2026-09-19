import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-lg shadow-black/20 ${
        hoverEffect ? "transition-all hover:border-slate-700 hover:shadow-slate-900/50" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
