import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "../services/api";
import { authService } from "../services/authService";
import { projectService } from "../services/projectService";
import { siteService } from "../services/siteService";
import { analyticsService } from "../services/analyticsService";

vi.mock("../services/api", () => {
  return {
    api: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
    getErrorMessage: vi.fn((err) => err?.message || "Error"),
  };
});

describe("Frontend API Service Layer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("authService", () => {
    it("calls /auth/login with credentials", async () => {
      const mockResponse = {
        data: {
          access_token: "jwt.token.mock",
          token_type: "bearer",
          user: { id: "user-1", email: "admin@darukaa.earth", role: "ADMIN" },
        },
      };
      (api.post as any).mockResolvedValueOnce(mockResponse);

      const result = await authService.login({
        email: "admin@darukaa.earth",
        password: "password123",
      });

      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "admin@darukaa.earth",
        password: "password123",
      });
      expect(result.access_token).toBe("jwt.token.mock");
      expect(result.user.role).toBe("ADMIN");
    });

    it("calls /auth/me to retrieve current user profile", async () => {
      (api.get as any).mockResolvedValueOnce({
        data: { id: "user-1", email: "admin@darukaa.earth", role: "ADMIN" },
      });

      const user = await authService.getMe();
      expect(api.get).toHaveBeenCalledWith("/auth/me");
      expect(user.id).toBe("user-1");
    });
  });

  describe("projectService", () => {
    it("calls /projects with search and status params", async () => {
      (api.get as any).mockResolvedValueOnce({
        data: [
          { id: "p-1", name: "Amazon Corridor", total_sites: 2, total_area_hectares: 2500 },
        ],
      });

      const projects = await projectService.listProjects({ search: "Amazon", status: "Active" });
      expect(api.get).toHaveBeenCalledWith("/projects", {
        params: { search: "Amazon", status: "Active" },
      });
      expect(projects.length).toBe(1);
      expect(projects[0].name).toBe("Amazon Corridor");
    });

    it("creates a new project via POST /projects", async () => {
      const payload = {
        name: "Mangrove Restoration",
        project_type: "Mangrove Restoration" as const,
        status: "Active" as const,
      };
      (api.post as any).mockResolvedValueOnce({
        data: { id: "p-2", ...payload },
      });

      const created = await projectService.createProject(payload);
      expect(api.post).toHaveBeenCalledWith("/projects", payload);
      expect(created.id).toBe("p-2");
    });
  });

  describe("siteService", () => {
    it("fetches GeoJSON feature collection via /sites/geojson", async () => {
      const mockGeo = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            id: "site-1",
            geometry: { type: "Polygon", coordinates: [] },
            properties: { name: "Tapajos Zone", area_hectares: 1200 },
          },
        ],
      };
      (api.get as any).mockResolvedValueOnce({ data: mockGeo });

      const geo = await siteService.getSitesGeoJSON();
      expect(api.get).toHaveBeenCalledWith("/sites/geojson", { params: undefined });
      expect(geo.features.length).toBe(1);
      expect(geo.features[0].properties.name).toBe("Tapajos Zone");
    });
  });

  describe("analyticsService", () => {
    it("fetches dashboard summary KPIs from /dashboard/summary", async () => {
      const mockSummary = {
        total_projects: 3,
        total_sites: 6,
        total_area_hectares: 12500.5,
        total_estimated_carbon: 750000,
        average_biodiversity_index: 3.8,
        average_vegetation_index: 0.68,
        projects_by_status: { Active: 3 },
        projects_by_type: { Agroforestry: 1 },
        recent_projects: [],
        featured_sites: [],
      };
      (api.get as any).mockResolvedValueOnce({ data: mockSummary });

      const summary = await analyticsService.getDashboardSummary();
      expect(api.get).toHaveBeenCalledWith("/dashboard/summary");
      expect(summary.total_projects).toBe(3);
      expect(summary.total_sites).toBe(6);
      expect(summary.total_area_hectares).toBe(12500.5);
    });

    it("fetches site analytics time-series records", async () => {
      const mockSeries = {
        site_id: "site-1",
        site_name: "Tapajos Zone",
        total_observations: 2,
        records: [
          { id: "obs-1", carbon_value: 45.2, biodiversity_value: 2.5, vegetation_value: 0.5 },
          { id: "obs-2", carbon_value: 52.1, biodiversity_value: 2.8, vegetation_value: 0.55 },
        ],
      };
      (api.get as any).mockResolvedValueOnce({ data: mockSeries });

      const series = await analyticsService.getSiteAnalytics("site-1");
      expect(api.get).toHaveBeenCalledWith("/sites/site-1/analytics");
      expect(series.total_observations).toBe(2);
      expect(series.records[1].carbon_value).toBe(52.1);
    });
  });
});
