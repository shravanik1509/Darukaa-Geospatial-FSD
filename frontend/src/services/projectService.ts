import { api } from "./api";
import { Project, ProjectCreatePayload, ProjectUpdatePayload } from "../types/project";
import { Site, SiteCreatePayload } from "../types/site";

export const projectService = {
  async listProjects(params?: { search?: string; status?: string; project_type?: string }): Promise<Project[]> {
    const res = await api.get<Project[]>("/projects", { params });
    return res.data;
  },

  async getProject(id: string): Promise<Project> {
    const res = await api.get<Project>(`/projects/${id}`);
    return res.data;
  },

  async createProject(payload: ProjectCreatePayload): Promise<Project> {
    const res = await api.post<Project>("/projects", payload);
    return res.data;
  },

  async updateProject(id: string, payload: ProjectUpdatePayload): Promise<Project> {
    const res = await api.put<Project>(`/projects/${id}`, payload);
    return res.data;
  },

  async deleteProject(id: string): Promise<{ detail: string }> {
    const res = await api.delete<{ detail: string }>(`/projects/${id}`);
    return res.data;
  },

  async listProjectSites(projectId: string): Promise<Site[]> {
    const res = await api.get<Site[]>(`/projects/${projectId}/sites`);
    return res.data;
  },

  async createSiteInProject(projectId: string, payload: SiteCreatePayload): Promise<Site> {
    const res = await api.post<Site>(`/projects/${projectId}/sites`, payload);
    return res.data;
  },
};
