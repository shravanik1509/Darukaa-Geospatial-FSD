import React from "react";
import { Link } from "react-router-dom";
import { TreePine } from "lucide-react";
import { Button } from "../components/common/Button";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-950/80 border border-brand-800 flex items-center justify-center text-brand-400 mb-4">
        <TreePine className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-white tracking-tight">404</h1>
      <h2 className="text-lg font-semibold text-slate-200 mt-2">Geospatial Resource Not Found</h2>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">
        The requested parcel, project, or coordinate page does not exist or has been moved.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button variant="primary" size="sm">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
