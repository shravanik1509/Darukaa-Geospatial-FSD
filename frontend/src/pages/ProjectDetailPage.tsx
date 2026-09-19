import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Edit,
  Globe2,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { projectService } from "../services/projectService";
import { siteService } from "../services/siteService";
import { Project, ProjectCreatePayload } from "../types/project";
import { GeoJSONFeatureCollection, Site } from "../types/site";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Spinner } from "../components/common/Spinner";
import { ProjectStatusBadge } from "../components/common/Badge";
import { MapboxViewer } from "../components/map/MapboxViewer";
import { ProjectFormModal } from "../components/projects/ProjectFormModal";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatHectares, formatNumber } from "../utils/formatters";

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [geojson, setGeojson] = useState<GeoJSONFeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProjectAndSites = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [projData, sitesData, geoData] = await Promise.all([
        projectService.getProject(id),
        projectService.listProjectSites(id),
        siteService.getSitesGeoJSON(id),
      ]);
      setProject(projData);
      setSites(sitesData);
      setGeojson(geoData);
    } catch (err) {
      console.error("Failed to load project details", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndSites();
  }, [id]);

  const handleUpdateProject = async (payload: ProjectCreatePayload) => {
    if (!id) return;
    await projectService.updateProject(id, payload);
    await fetchProjectAndSites();
  };

  const handleDeleteSite = async (siteId: string, siteName: string) => {
    if (window.confirm(`Are you sure you want to delete site '${siteName}'?`)) {
      await siteService.deleteSite(siteId);
      await fetchProjectAndSites();
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <span className="text-xs text-slate-400">Loading project details...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-white">Project Not Found</h2>
        <Button variant="secondary" size="sm" onClick={() => navigate("/projects")} className="mt-4">
          Return to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects Directory
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-white tracking-tight">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
            <span>{project.project_type}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              {formatDate(project.start_date)} — {formatDate(project.end_date)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                leftIcon={<Edit className="w-3.5 h-3.5" />}
              >
                Edit
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/projects/${project.id}/sites/new`)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Draw New Site Boundary
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Project KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Monitored Sites
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {project.total_sites} <span className="text-xs font-normal text-slate-400">parcels</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Mapped Hectares
          </div>
          <div className="text-2xl font-black text-brand-400 mt-2 font-mono">
            {formatHectares(project.total_area_hectares)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Target Carbon Offset
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {project.target_carbon_offset
              ? `${formatNumber(project.target_carbon_offset, 0)} tCO2e`
              : "Not Specified"}
          </div>
        </Card>
      </div>

      {/* Project Description & Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-2">Project Overview</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {project.description || "No description specified for this project."}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Created</span>
              <span className="text-slate-200">{formatDate(project.created_at)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Last Modified</span>
              <span className="text-slate-200">{formatDate(project.updated_at)}</span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-brand-400" />
              Project Site Boundaries
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {sites.length} Active Polygon(s)
            </span>
          </div>
          <div className="p-2 bg-slate-950">
            <MapboxViewer geojson={geojson} height="360px" />
          </div>
        </Card>
      </div>

      {/* Sites List */}
      <Card className="p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Project Geographical Sites</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any site to view detailed time-series environmental analytics and historical measurements.
            </p>
          </div>

          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/projects/${project.id}/sites/new`)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Site
            </Button>
          )}
        </div>

        {sites.length === 0 ? (
          <div className="text-center py-10">
            <MapPin className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-white">No Sites Added Yet</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Use the polygon drawing studio to trace geographical boundaries on Mapbox.
            </p>
            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                onClick={() => navigate(`/projects/${project.id}/sites/new`)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Draw First Site Boundary
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Site Name</th>
                  <th className="pb-3">Ecosystem</th>
                  <th className="pb-3">Area (Hectares)</th>
                  <th className="pb-3">Latest Carbon</th>
                  <th className="pb-3">Biodiversity</th>
                  <th className="pb-3">NDVI</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sites.map((site) => (
                  <tr key={site.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 font-semibold text-white">
                      <Link to={`/sites/${site.id}`} className="hover:text-brand-400">
                        {site.name}
                      </Link>
                    </td>
                    <td className="py-3 text-slate-300">{site.ecosystem_type}</td>
                    <td className="py-3 font-mono text-brand-400 font-bold">
                      {formatHectares(site.area_hectares)}
                    </td>
                    <td className="py-3 font-mono text-slate-300">
                      {site.latest_carbon ? `${site.latest_carbon} tCO2e/ha` : "—"}
                    </td>
                    <td className="py-3 font-mono text-slate-300">
                      {site.latest_biodiversity ? `${site.latest_biodiversity} / 5` : "—"}
                    </td>
                    <td className="py-3 font-mono text-slate-300">
                      {site.latest_vegetation ?? "—"}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/sites/${site.id}`}
                          className="inline-flex items-center text-xs font-semibold text-brand-400 hover:text-brand-300"
                        >
                          Analytics <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteSite(site.id, site.name)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition"
                            title="Delete Site"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      <ProjectFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateProject}
        projectToEdit={project}
      />
    </div>
  );
};
