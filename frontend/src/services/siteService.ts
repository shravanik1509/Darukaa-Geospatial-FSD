import { api } from "./api";
import { GeoJSONFeatureCollection, Site, SiteUpdatePayload } from "../types/site";

export const siteService = {
  async listSites(projectId?: string): Promise<Site[]> {
    const res = await api.get<Site[]>("/sites", {
      params: projectId ? { project_id: projectId } : undefined,
    });
    return res.data;
  },

  async getSitesGeoJSON(projectId?: string): Promise<GeoJSONFeatureCollection> {
    const res = await api.get<GeoJSONFeatureCollection>("/sites/geojson", {
      params: projectId ? { project_id: projectId } : undefined,
    });
    return res.data;
  },

  async getSite(id: string): Promise<Site> {
    const res = await api.get<Site>(`/sites/${id}`);
    return res.data;
  },

  async updateSite(id: string, payload: SiteUpdatePayload): Promise<Site> {
    const res = await api.put<Site>(`/sites/${id}`, payload);
    return res.data;
  },

  async deleteSite(id: string): Promise<{ detail: string }> {
    const res = await api.delete<{ detail: string }>(`/sites/${id}`);
    return res.data;
  },
};
