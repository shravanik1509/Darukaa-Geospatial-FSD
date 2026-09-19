import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Filter,
  Globe,
  Search,
} from "lucide-react";
import { siteService } from "../services/siteService";
import { projectService } from "../services/projectService";
import { GeoJSONFeatureCollection, Site } from "../types/site";
import { Project } from "../types/project";
import { MapboxViewer } from "../components/map/MapboxViewer";
import { Card } from "../components/common/Card";
import { Spinner } from "../components/common/Spinner";
import { formatHectares } from "../utils/formatters";

export const MapExplorerPage: React.FC = () => {
  const [geojson, setGeojson] = useState<GeoJSONFeatureCollection | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [selectedSiteId, setSelectedSiteId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [geo, sList, pList] = await Promise.all([
          siteService.getSitesGeoJSON(selectedProjectId || undefined),
          siteService.listSites(selectedProjectId || undefined),
          projectService.listProjects(),
        ]);
        setGeojson(geo);
        setSites(sList);
        setProjects(pList);
      } catch (err) {
        console.error("Failed to load map data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedProjectId]);

  const filteredSites = sites.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.ecosystem_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Spatial Explorer</h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore global project sites, inspect WGS84 polygon boundaries, and filter by project or ecosystem.
        </p>
      </div>

      {/* 2-Column Explorer: Left site drawer, Right full Mapbox canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter & Site Index */}
        <Card className="lg:col-span-4 p-4 space-y-4 max-h-[750px] flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-400" />
              Filter Sites ({filteredSites.length})
            </h2>
            {selectedProjectId && (
              <button
                onClick={() => setSelectedProjectId("")}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Select Project
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">All Conservation Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by site or ecosystem..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Scrollable list of sites */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800/60">
            {isLoading ? (
              <div className="py-12 flex justify-center">
                <Spinner size="md" />
              </div>
            ) : filteredSites.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No sites matched the filter.
              </div>
            ) : (
              filteredSites.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSiteId(s.id)}
                  className={`pt-2.5 pb-2.5 px-3 rounded-lg cursor-pointer transition ${
                    selectedSiteId === s.id
                      ? "bg-brand-950/60 border border-brand-800 text-white"
                      : "hover:bg-slate-800/40 text-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-white">{s.name}</span>
                    <span className="text-[11px] font-mono text-brand-400 font-bold">
                      {formatHectares(s.area_hectares)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                    <span>{s.ecosystem_type}</span>
                    <Link
                      to={`/sites/${s.id}`}
                      className="text-brand-400 hover:text-brand-300 font-medium inline-flex items-center"
                    >
                      Analytics <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right Map Canvas */}
        <div className="lg:col-span-8">
          <Card className="p-0 overflow-hidden">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-brand-400" />
                PostGIS Polygons (SRID 4326)
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                {geojson?.features.length || 0} Layers Rendered
              </span>
            </div>
            <div className="p-2 bg-slate-950">
              <MapboxViewer
                geojson={geojson}
                selectedSiteId={selectedSiteId}
                onSiteClick={(siteId) => setSelectedSiteId(siteId)}
                height="700px"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
