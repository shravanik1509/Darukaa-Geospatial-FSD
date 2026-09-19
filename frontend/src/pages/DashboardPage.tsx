import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  ChevronRight,
  Database,
  FolderTree,
  Globe2,
  Leaf,
  Plus,
} from "lucide-react";
import { analyticsService } from "../services/analyticsService";
import { siteService } from "../services/siteService";
import { projectService } from "../services/projectService";
import { DashboardSummary } from "../types/analytics";
import { GeoJSONFeatureCollection } from "../types/site";
import { MetricCard } from "../components/charts/MetricCard";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Spinner } from "../components/common/Spinner";
import { MapboxViewer } from "../components/map/MapboxViewer";
import { ProjectStatusBadge } from "../components/common/Badge";
import { ProjectFormModal } from "../components/projects/ProjectFormModal";
import { useAuth } from "../context/AuthContext";
import { formatHectares, formatNumber } from "../utils/formatters";
import { ProjectCreatePayload } from "../types/project";

export const DashboardPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [geojson, setGeojson] = useState<GeoJSONFeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [sumData, geoData] = await Promise.all([
        analyticsService.getDashboardSummary(),
        siteService.getSitesGeoJSON(),
      ]);
      setSummary(sumData);
      setGeojson(geoData);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (payload: ProjectCreatePayload) => {
    await projectService.createProject(payload);
    await fetchData();
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <span className="text-sm font-medium text-slate-400">Loading geospatial dashboard...</span>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-8 text-center bg-rose-950/20 border border-rose-800 rounded-xl max-w-lg mx-auto mt-12">
        <h3 className="text-lg font-bold text-rose-300">Dashboard Unavailable</h3>
        <p className="text-xs text-slate-400 mt-2">{error || "Could not retrieve summary metrics."}</p>
        <Button variant="secondary" size="sm" onClick={fetchData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Environmental Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global carbon sequestration, ecological baseline monitoring, and PostGIS parcel boundaries.
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Project
          </Button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Active Projects"
          value={summary.total_projects}
          icon={<FolderTree className="w-5 h-5" />}
          variant="blue"
        />
        <MetricCard
          title="Monitored Sites"
          value={summary.total_sites}
          icon={<Globe2 className="w-5 h-5" />}
          variant="brand"
        />
        <MetricCard
          title="Mapped Area"
          value={formatNumber(summary.total_area_hectares, 1)}
          unit="Hectares"
          icon={<Database className="w-5 h-5" />}
          variant="amber"
        />
        <MetricCard
          title="Carbon Stock"
          value={formatNumber(summary.total_estimated_carbon, 0)}
          unit="tCO2e"
          icon={<Leaf className="w-5 h-5" />}
          variant="brand"
        />
        <MetricCard
          title="Avg Biodiversity"
          value={summary.average_biodiversity_index}
          unit="/ 5.0"
          icon={<Activity className="w-5 h-5" />}
          variant="purple"
        />
      </div>

      {/* Interactive Global Map Card */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-brand-400" />
              Global Conservation Parcels Map
            </h2>
            <p className="text-[11px] text-slate-400">
              Interactive boundaries stored in PostGIS SRID 4326. Click any parcel to view metrics.
            </p>
          </div>
          <Link
            to="/map"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            Full Map Studio <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-2 bg-slate-950">
          <MapboxViewer geojson={geojson} height="460px" />
        </div>
      </Card>

      {/* Projects and Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects Table */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white">Recent Conservation Projects</h3>
              <Link
                to="/projects"
                className="text-xs font-semibold text-brand-400 hover:text-brand-300"
              >
                View all ({summary.total_projects})
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                    <th className="pb-3">Project Title</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Sites</th>
                    <th className="pb-3">Area (ha)</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {summary.recent_projects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 font-semibold text-white">
                        <Link to={`/projects/${project.id}`} className="hover:text-brand-400">
                          {project.name}
                        </Link>
                      </td>
                      <td className="py-3 text-slate-300">{project.project_type}</td>
                      <td className="py-3">
                        <ProjectStatusBadge status={project.status} />
                      </td>
                      <td className="py-3 font-mono text-slate-300">{project.total_sites}</td>
                      <td className="py-3 font-mono text-slate-300">
                        {formatHectares(project.total_area_hectares)}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/projects/${project.id}`}
                          className="inline-flex items-center text-brand-400 hover:text-brand-300 font-semibold"
                        >
                          Details <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Biome / Project Type Distribution */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800 mb-4">
              Restoration Biomes
            </h3>
            <div className="space-y-3">
              {Object.entries(summary.projects_by_type).map(([type, count]) => {
                const pct = Math.round((count / Math.max(1, summary.total_projects)) * 100);
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{type}</span>
                      <span className="text-slate-400 font-mono">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Spatial Engine</span>
            <span className="font-mono text-emerald-400 font-bold">PostgreSQL 16 + PostGIS</span>
          </div>
        </Card>
      </div>

      {/* Create Project Modal */}
      <ProjectFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};
