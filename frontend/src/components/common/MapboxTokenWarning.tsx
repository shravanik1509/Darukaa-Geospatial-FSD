import React from "react";
import { AlertTriangle, Key, ExternalLink } from "lucide-react";

interface MapboxTokenWarningProps {
  className?: string;
}

export const MapboxTokenWarning: React.FC<MapboxTokenWarningProps> = ({ className = "" }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-amber-500/40 bg-amber-950/30 p-6 backdrop-blur-sm text-amber-200 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h4 className="text-base font-semibold text-amber-300">
            Mapbox Access Token Not Configured
          </h4>
          <p className="text-sm text-amber-200/80 leading-relaxed">
            To display interactive vector basemaps, 3D terrain, and satellite imagery, please provide a free Mapbox public token.
          </p>
          <div className="bg-slate-950/80 rounded-lg p-3 font-mono text-xs border border-slate-800 text-slate-300">
            <code>
              # Add to frontend/.env<br />
              VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1...
            </code>
          </div>
          <div className="pt-1 flex items-center gap-3">
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-4"
            >
              <Key className="w-3.5 h-3.5" />
              Get Free Mapbox Token
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
