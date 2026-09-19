import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Database,
  FileSpreadsheet,
  Globe2,
  Leaf,
  Plus,
  TreePine,
} from "lucide-react";
import { siteService } from "../services/siteService";
import { analyticsService } from "../services/analyticsService";
import { Site, GeoJSONFeatureCollection } from "../types/site";
import { SiteAnalyticsSummary, ObservationPayload } from "../types/analytics";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Spinner } from "../components/common/Spinner";
import { MetricCard } from "../components/charts/MetricCard";
import { CarbonChart } from "../components/charts/CarbonChart";
import { BiodiversityChart } from "../components/charts/BiodiversityChart";
import { VegetationChart } from "../components/charts/VegetationChart";
import { MapboxViewer } from "../components/map/MapboxViewer";
import { AddObservationModal } from "../components/sites/AddObservationModal";
import { useAuth } from "../context/AuthContext";
import { formatDateTime, formatHectares, formatNumber } from "../utils/formatters";

export const SiteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [site, setSite] = useState<Site | null>(null);
  const [analytics, setAnalytics] = useState<SiteAnalyticsSummary | null>(null);
  const [activeTab, setActiveTab] = useState<"carbon" | "biodiversity" | "vegetation">("carbon");
  const [isLoading, setIsLoading] = useState(true);
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);

  const fetchSiteData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [siteData, analyticsData] = await Promise.all([
        siteService.getSite(id),
        analyticsService.getSiteAnalytics(id),
      ]);
      setSite(siteData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Failed to load site details", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteData();
  }, [id]);

  const handleAddObservation = async (payload: ObservationPayload) => {
    if (!id) return;
    await analyticsService.addObservation(id, payload);
    await fetchSiteData();
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <span className="text-xs text-slate-400">Loading site environmental analytics...</span>
      </div>
    );
  }

  if (!site || !analytics) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-white">Geospatial Site Not Found</h2>
        <Button variant="secondary" size="sm" onClick={() => navigate("/dashboard")} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Create single-feature collection for the Mapbox viewer
  const singleSiteGeoJSON: GeoJSONFeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        id: site.id,
        geometry: site.geometry,
        properties: {
          id: site.id,
          project_id: site.project_id,
          project_name: site.project_name,
          name: site.name,
          description: site.description,
          ecosystem_type: site.ecosystem_type,
          area_hectares: site.area_hectares,
          center_latitude: site.center_latitude,
          center_longitude: site.center_longitude,
          latest_carbon: site.latest_carbon,
          latest_biodiversity: site.latest_biodiversity,
          latest_vegetation: site.latest_vegetation,
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div>
        <Link
          to={`/projects/${site.project_id}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to {site.project_name || "Project"}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-800">
                {site.ecosystem_type}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {formatHectares(site.area_hectares)}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">{site.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Project: <strong className="text-slate-200">{site.project_name}</strong>
              {site.center_latitude && site.center_longitude && (
                <span className="ml-3 font-mono text-[11px] text-slate-400">
                  [{site.center_latitude.toFixed(4)}° N, {site.center_longitude.toFixed(4)}° E]
                </span>
              )}
            </p>
          </div>

          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsObsModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Log Measurement
            </Button>
          )}
        </div>
      </div>

      {/* Real-time Metric KPI Cards with Trends */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Carbon Stock"
          value={analytics.carbon_trend?.current ?? (site.latest_carbon || "—")}
          unit="tCO2e/ha"
          changePercentage={analytics.carbon_trend?.change_percentage}
          changeLabel="vs previous cycle"
          icon={<Leaf className="w-5 h-5" />}
          variant="brand"
        />

        <MetricCard
          title="Biodiversity Score"
          value={analytics.biodiversity_trend?.current ?? (site.latest_biodiversity || "—")}
          unit="/ 5.0"
          changePercentage={analytics.biodiversity_trend?.change_percentage}
          changeLabel="Shannon Index"
          icon={<Activity className="w-5 h-5" />}
          variant="blue"
        />

        <MetricCard
          title="Vegetation Index (NDVI)"
          value={analytics.vegetation_trend?.current ?? (site.latest_vegetation || "—")}
          unit="Index (-1 to 1)"
          changePercentage={analytics.vegetation_trend?.change_percentage}
          changeLabel="Canopy vigor"
          icon={<TreePine className="w-5 h-5" />}
          variant="purple"
        />

        <MetricCard
          title="Parcel Area"
          value={formatNumber(site.area_hectares, 1)}
          unit="Hectares"
          icon={<Database className="w-5 h-5" />}
          variant="amber"
        />
      </div>

      {/* 2-Column: Left Polygon Map Visualizer, Right Time-Series Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Mapbox Polygon Boundary Viewer */}
        <Card className="lg:col-span-5 p-0 overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-brand-400" />
              PostGIS Boundary Boundary (WGS84)
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">
              SRID 4326 Verified
            </span>
          </div>
          <div className="p-2 bg-slate-950">
            <MapboxViewer
              geojson={singleSiteGeoJSON}
              selectedSiteId={site.id}
              height="400px"
              initialCenter={[
                site.center_longitude || -54.95,
                site.center_latitude || -3.23,
              ]}
              initialZoom={11}
            />
          </div>
          <div className="p-3 bg-slate-900/60 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
            <span>Centroid coordinates:</span>
            <span className="font-mono text-slate-200">
              {site.center_latitude?.toFixed(5)}, {site.center_longitude?.toFixed(5)}
            </span>
          </div>
        </Card>

        {/* Right: Chart.js Interactive Performance Curves */}
        <Card className="lg:col-span-7 p-5">
          {/* Chart Tabs */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("carbon")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === "carbon"
                    ? "bg-brand-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                Carbon Sequestration
              </button>
              <button
                onClick={() => setActiveTab("biodiversity")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === "biodiversity"
                    ? "bg-sky-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                Biodiversity Recovery
              </button>
              <button
                onClick={() => setActiveTab("vegetation")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === "vegetation"
                    ? "bg-purple-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                Vegetation & Canopy
              </button>
            </div>

            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              {analytics.total_observations} records
            </span>
          </div>

          {/* Active Chart */}
          <div className="pt-2">
            {activeTab === "carbon" && <CarbonChart records={analytics.records} height={340} />}
            {activeTab === "biodiversity" && (
              <BiodiversityChart records={analytics.records} height={340} />
            )}
            {activeTab === "vegetation" && (
              <VegetationChart records={analytics.records} height={340} />
            )}
          </div>
        </Card>
      </div>

      {/* Historical Observations Log Table */}
      <Card className="p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-brand-400" />
              Historical Field Observations ({analytics.records.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified chronological measurements recorded in the PostGIS time-series database.
            </p>
          </div>

          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsObsModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Log Measurement
            </Button>
          )}
        </div>

        {analytics.records.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No observations recorded for this parcel yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Carbon (tCO2e/ha)</th>
                  <th className="pb-3">Biodiversity (H')</th>
                  <th className="pb-3">NDVI Index</th>
                  <th className="pb-3">Canopy Cover</th>
                  <th className="pb-3">Soil Moisture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {[...analytics.records]
                  .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
                  .map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 text-slate-300 font-sans">
                        {formatDateTime(rec.recorded_at)}
                      </td>
                      <td className="py-2.5 text-emerald-400 font-bold">
                        {rec.carbon_value.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-sky-400">
                        {rec.biodiversity_value.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-purple-400">
                        {rec.vegetation_value.toFixed(3)}
                      </td>
                      <td className="py-2.5 text-yellow-400">
                        {rec.canopy_cover_percentage !== null && rec.canopy_cover_percentage !== undefined
                          ? `${rec.canopy_cover_percentage}%`
                          : "—"}
                      </td>
                      <td className="py-2.5 text-cyan-400">
                        {rec.soil_moisture_percentage !== null && rec.soil_moisture_percentage !== undefined
                          ? `${rec.soil_moisture_percentage}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Observation Modal */}
      <AddObservationModal
        isOpen={isObsModalOpen}
        onClose={() => setIsObsModalOpen(false)}
        onSubmit={handleAddObservation}
        siteName={site.name}
      />
    </div>
  );
};
