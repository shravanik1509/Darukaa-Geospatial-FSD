import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { DashboardPage } from "../pages/DashboardPage";
import { analyticsService } from "../services/analyticsService";
import { siteService } from "../services/siteService";
import { AuthContext } from "../context/AuthContext";

vi.mock("../services/analyticsService", () => ({
  analyticsService: {
    getDashboardSummary: vi.fn(),
  },
}));

vi.mock("../services/siteService", () => ({
  siteService: {
    getSitesGeoJSON: vi.fn(),
  },
}));

vi.mock("../components/map/MapboxViewer", () => ({
  MapboxViewer: () => <div data-testid="mapbox-viewer">Map Viewer Mock</div>,
}));

const mockSummary = {
  total_projects: 3,
  total_sites: 6,
  total_area_hectares: 2450.5,
  total_estimated_carbon: 18450.2,
  average_biodiversity_index: 82.4,
  average_vegetation_index: 0.78,
  projects_by_status: { ACTIVE: 3 },
  projects_by_type: { Reforestation: 2, Wetland: 1 },
  recent_projects: [
    {
      id: "proj-1",
      name: "Amazon Rainforest Reforestation",
      country: "Brazil",
      status: "ACTIVE" as const,
      total_sites: 3,
      total_area_hectares: 1200.0,
      carbon_target_tons: 50000.0,
      created_at: "2026-01-01T00:00:00Z",
    },
  ],
  featured_sites: [],
};

const mockGeoJSON = {
  type: "FeatureCollection",
  features: [],
};

describe("DashboardPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDashboard = (isAdmin = true) => {
    const authContextValue = {
      user: {
        id: "usr-1",
        email: "admin@darukaa.earth",
        full_name: "Admin User",
        role: isAdmin ? ("ADMIN" as const) : ("ANALYST" as const),
        is_active: true,
        created_at: "2026-01-01T00:00:00Z",
      },
      token: "mock-token",
      isAuthenticated: true,
      isAdmin,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    };

    return render(
      <AuthContext.Provider value={authContextValue}>
        <BrowserRouter>
          <DashboardPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );
  };

  it("renders loading state initially and then shows KPI metrics", async () => {
    vi.mocked(analyticsService.getDashboardSummary).mockResolvedValueOnce(mockSummary);
    vi.mocked(siteService.getSitesGeoJSON).mockResolvedValueOnce(mockGeoJSON as any);

    renderDashboard();

    expect(screen.getByText(/loading geospatial dashboard/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Amazon Rainforest Reforestation")).toBeInTheDocument();
    });

    // Check KPI titles and values
    expect(screen.getByText("Active Projects")).toBeInTheDocument();
    expect(screen.getByText("Monitored Sites")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("Mapped Area")).toBeInTheDocument();
    expect(screen.getByText("Carbon Stock")).toBeInTheDocument();
    expect(screen.getByText("Avg Biodiversity")).toBeInTheDocument();
    expect(screen.getByText("82.4")).toBeInTheDocument();
  });

  it("renders New Project button for Admin users", async () => {
    vi.mocked(analyticsService.getDashboardSummary).mockResolvedValueOnce(mockSummary);
    vi.mocked(siteService.getSitesGeoJSON).mockResolvedValueOnce(mockGeoJSON as any);

    renderDashboard(true);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /new project/i })).toBeInTheDocument();
    });
  });

  it("hides New Project button for non-admin Analyst users", async () => {
    vi.mocked(analyticsService.getDashboardSummary).mockResolvedValueOnce(mockSummary);
    vi.mocked(siteService.getSitesGeoJSON).mockResolvedValueOnce(mockGeoJSON as any);

    renderDashboard(false);

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /new project/i })).not.toBeInTheDocument();
    });
  });

  it("shows error state when dashboard analytics fails to fetch", async () => {
    vi.mocked(analyticsService.getDashboardSummary).mockRejectedValueOnce(
      new Error("Network connection lost")
    );
    vi.mocked(siteService.getSitesGeoJSON).mockResolvedValueOnce(mockGeoJSON as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Dashboard Unavailable")).toBeInTheDocument();
      expect(screen.getByText("Network connection lost")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    });
  });
});
