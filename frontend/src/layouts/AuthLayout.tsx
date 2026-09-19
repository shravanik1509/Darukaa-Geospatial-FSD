import React from "react";
import { Globe2, ShieldCheck, TreePine } from "lucide-react";

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-700/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 text-center z-10">
        <div className="inline-flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-900/30">
            <TreePine className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            Darukaa<span className="text-brand-400">.Earth</span>
          </span>
        </div>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Geospatial ESG & Carbon Sequestration Analytics Platform
        </p>
      </div>

      {/* Main card */}
      <div className="w-full max-w-md z-10">{children}</div>

      {/* Footer info */}
      <div className="mt-8 text-center text-xs text-slate-500 flex items-center gap-4 z-10">
        <span className="inline-flex items-center gap-1.5">
          <Globe2 className="w-3.5 h-3.5 text-brand-500" />
          PostGIS Spatial Engine
        </span>
        <span>•</span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
          JWT RBAC Protected
        </span>
      </div>
    </div>
  );
};
