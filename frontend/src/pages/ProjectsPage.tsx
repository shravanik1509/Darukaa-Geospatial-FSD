import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Edit2,
  FolderPlus,
  FolderTree,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { projectService } from "../services/projectService";
import { Project, ProjectCreatePayload } from "../types/project";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Spinner } from "../components/common/Spinner";
import { ProjectStatusBadge } from "../components/common/Badge";
import { ProjectFormModal } from "../components/projects/ProjectFormModal";
import { useAuth } from "../context/AuthContext";
import { formatHectares, formatNumber } from "../utils/formatters";

export const ProjectsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await projectService.listProjects({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleCreateOrUpdate = async (payload: ProjectCreatePayload) => {
    if (editingProject) {
      await projectService.updateProject(editingProject.id, payload);
    } else {
      await projectService.createProject(payload);
    }
    await fetchProjects();
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete '${name}' and all its sites?`)) {
      await projectService.deleteProject(id);
      await fetchProjects();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Conservation Projects</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, manage, and add geographical sites to environmental restoration programs.
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            onClick={() => {
              setEditingProject(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Project
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by project name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">All Project Statuses</option>
              <option value="Active">Active</option>
              <option value="Planning">Planning</option>
              <option value="Under Review">Under Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Projects List */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <span className="text-xs text-slate-400">Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-12 text-center">
          <FolderTree className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Projects Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search || statusFilter
              ? "No conservation projects matched your search criteria."
              : "No conservation projects exist in the database yet."}
          </p>
          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => {
                setEditingProject(null);
                setIsModalOpen(true);
              }}
              leftIcon={<FolderPlus className="w-4 h-4" />}
            >
              Create First Project
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} hoverEffect className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {project.project_type}
                  </span>
                  <ProjectStatusBadge status={project.status} />
                </div>

                <Link
                  to={`/projects/${project.id}`}
                  className="text-base font-bold text-white hover:text-brand-400 transition block mt-1"
                >
                  {project.name}
                </Link>

                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {project.description || "No description provided."}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Sites Monitored</span>
                    <span className="font-bold text-slate-200 font-mono text-sm">
                      {project.total_sites} sites
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Mapped Area</span>
                    <span className="font-bold text-brand-400 font-mono text-sm">
                      {formatHectares(project.total_area_hectares)}
                    </span>
                  </div>
                </div>

                {project.target_carbon_offset && (
                  <div className="text-[11px] text-slate-400">
                    Target Offset: <strong className="text-slate-200">{formatNumber(project.target_carbon_offset, 0)} tCO2e</strong>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-xs font-semibold text-brand-400 hover:text-brand-300"
                  >
                    View Sites & Map →
                  </Link>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingProject(project);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id, project.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-950/20 transition"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        projectToEdit={editingProject}
      />
    </div>
  );
};
