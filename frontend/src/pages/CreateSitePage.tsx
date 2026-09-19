import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Layers, Save, ShieldAlert } from "lucide-react";
import { projectService } from "../services/projectService";
import { Project } from "../types/project";
import { GeoJSONPolygonGeometry } from "../types/site";
import { MapboxDrawStudio } from "../components/map/MapboxDrawStudio";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Spinner } from "../components/common/Spinner";
import { formatHectares } from "../utils/formatters";
import { getErrorMessage } from "../services/api";

export const CreateSitePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ecosystemType, setEcosystemType] = useState("Tropical Rainforest");
  const [geometry, setGeometry] = useState<GeoJSONPolygonGeometry | null>(null);
  const [estimatedArea, setEstimatedArea] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProj() {
      if (!id) return;
      try {
        setIsLoadingProject(true);
        const p = await projectService.getProject(id);
        setProject(p);
      } catch (err) {
        console.error("Failed to load parent project", err);
      } finally {
        setIsLoadingProject(false);
      }
    }
    loadProj();
  }, [id]);

  const handlePolygonChange = (geom: GeoJSONPolygonGeometry | null, areaHa: number) => {
    setGeometry(geom);
    setEstimatedArea(areaHa);
    if (geom) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!name.trim()) {
      setError("Please provide a site name or parcel identifier.");
      return;
    }
    if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
      setError("Please draw a closed polygon on the map before saving.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const createdSite = await projectService.createSiteInProject(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        ecosystem_type: ecosystemType,
        geometry,
      });

      // Navigate directly to the newly created site's detailed analytics page
      navigate(`/sites/${createdSite.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProject) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <span className="text-xs text-slate-400">Loading project context...</span>
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
      {/* Top Header */}
      <div>
        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to {project.name}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Draw Site Boundary: {project.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Use Mapbox Draw on the satellite basemap to trace parcel boundaries. Coordinates will be validated and converted into a native PostGIS Polygon.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-medium flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2-Column Studio Grid: Left Form, Right Mapbox Draw */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Metadata Form */}
        <Card className="lg:col-span-4 p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-400" />
            Parcel Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Site / Parcel Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tapajós River Canopy Sector A"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ecosystem Type *
              </label>
              <select
                value={ecosystemType}
                onChange={(e) => setEcosystemType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
              >
                <option value="Tropical Rainforest">Tropical Rainforest</option>
                <option value="Tropical Moist Forest">Tropical Moist Forest</option>
                <option value="Coastal Mangrove">Coastal Mangrove</option>
                <option value="Estuarine Mangrove Wetland">Estuarine Mangrove Wetland</option>
                <option value="Temperate Conifer Woodland">Temperate Conifer Woodland</option>
                <option value="Peatland & Moorland">Peatland & Moorland</option>
                <option value="Agroforestry Mixed Agroecosystem">Agroforestry Mixed Agroecosystem</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Soil conditions, canopy cover target, native flora, community boundary agreement..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Geometry validation status box */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Polygon Status:</span>
                {geometry ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Polygon Closed
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">Waiting for drawing...</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Estimated Area:</span>
                <span className="font-mono text-brand-400 font-bold">
                  {formatHectares(estimatedArea)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save to PostGIS Database
            </Button>
          </form>
        </Card>

        {/* Right: Mapbox Draw Studio */}
        <div className="lg:col-span-8">
          <MapboxDrawStudio
            onPolygonChange={handlePolygonChange}
            height="580px"
          />
        </div>
      </div>
    </div>
  );
};
