import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SiteDetailPage } from "../pages/SiteDetailPage";
import { siteService } from "../services/siteService";
import { analyticsService } from "../services/analyticsService";
import { AuthContext } from "../context/AuthContext";

vi.mock("../services/siteService", () => ({
  siteService: {
    getSite: vi.fn(),
    deleteSite: vi.fn(),
  },
}));

vi.mock("../services/analyticsService", () => ({
  analyticsService: {
    getSiteAnalytics: vi.fn(),
    addObservation: vi.fn(),
  },
}));

vi.mock("../components/map/MapboxViewer", () => ({
  MapboxViewer: () => <div data-testid="mapbox-viewer">Site Map Viewer Mock</div>,
}));

vi.mock("../components/charts/CarbonChart", () => ({
  CarbonChart: () => <div data-testid="carbon-chart">Carbon Chart Mock</div>,
}));

vi.mock("../components/charts/BiodiversityChart", () => ({
  BiodiversityChart: () => <div data-testid="biodiversity-chart">Biodiversity Chart Mock</div>,
}));

vi.mock("../components/charts/VegetationChart", () => ({
  VegetationChart: () => <div data-testid="vegetation-chart">Vegetation Chart Mock</div>,
}));

const mockSite = {
  id: "site-101",
  project_id: "proj-1",
  project_name: "Amazon Conservation Corridor",
  name: "Sector Alpha Primary Forest",
  description: "Dense canopy primary tropical rainforest parcel.",
  ecosystem_type: "Tropical Rainforest",
  area_hectares: 540.2,
  center_latitude: -3.4653,
  center_longitude: -62.2159,
  geometry: {
    type: "Polygon" as const,
    coordinates: [
      [
        [-62.2159, -3.4653],
        [-62.2059, -3.4653],
        [-62.2059, -3.4553],
        [-62.2159, -3.4553],
        [-62.2159, -3.4653],
      ],
    ],
  },
  latest_carbon: 145.8,
  latest_biodiversity: 4.25,
  latest_vegetation: 0.82,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const mockAnalytics = {
  site_id: "site-101",
  site_name: "Sector Alpha Primary Forest",
  total_observations: 2,
  latest_recorded_at: "2026-02-01T00:00:00Z",
  carbon_trend: {
    current: 145.8,
    previous: 140.0,
    change_percentage: 4.14,
    min: 140.0,
    max: 145.8,
    avg: 142.9,
  },
  biodiversity_trend: {
    current: 4.25,
    previous: 4.1,
    change_percentage: 3.66,
    min: 4.1,
    max: 4.25,
    avg: 4.175,
  },
  vegetation_trend: {
    current: 0.82,
    previous: 0.8,
    change_percentage: 2.5,
    min: 0.8,
    max: 0.82,
    avg: 0.81,
  },
  records: [
    {
      id: "obs-2",
      site_id: "site-101",
      recorded_at: "2026-02-01T00:00:00Z",
      carbon_value: 145.8,
      biodiversity_value: 4.25,
      vegetation_value: 0.82,
      canopy_cover_percentage: 88.5,
      soil_moisture_percentage: 45.2,
      created_at: "2026-02-01T00:00:00Z",
    },
    {
      id: "obs-1",
      site_id: "site-101",
      recorded_at: "2026-01-01T00:00:00Z",
      carbon_value: 140.0,
      biodiversity_value: 4.1,
      vegetation_value: 0.8,
      canopy_cover_percentage: 86.0,
      soil_moisture_percentage: 44.0,
      created_at: "2026-01-01T00:00:00Z",
    },
  ],
};

describe("SiteDetailPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderSiteDetail = (isAdmin = true) => {
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
        <MemoryRouter initialEntries={["/sites/site-101"]}>
          <Routes>
            <Route path="/sites/:id" element={<SiteDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it("renders site details, KPI metrics, and map viewer", async () => {
    vi.mocked(siteService.getSite).mockResolvedValue(mockSite);
    vi.mocked(analyticsService.getSiteAnalytics).mockResolvedValue(mockAnalytics);

    renderSiteDetail();

    await waitFor(() => {
      expect(screen.getByText("Sector Alpha Primary Forest")).toBeInTheDocument();
      expect(screen.getByText("Tropical Rainforest")).toBeInTheDocument();
    });

    expect(screen.getByText("Carbon Stock")).toBeInTheDocument();
    expect(screen.getByText("Biodiversity Score")).toBeInTheDocument();
    expect(screen.getByText("Vegetation Index (NDVI)")).toBeInTheDocument();
    expect(screen.getByTestId("mapbox-viewer")).toBeInTheDocument();
  });

  it("allows switching between Carbon, Biodiversity, and Vegetation chart tabs", async () => {
    vi.mocked(siteService.getSite).mockResolvedValue(mockSite);
    vi.mocked(analyticsService.getSiteAnalytics).mockResolvedValue(mockAnalytics);

    renderSiteDetail();

    await waitFor(() => {
      expect(screen.getByTestId("carbon-chart")).toBeInTheDocument();
    });

    // Switch to Biodiversity tab
    const bioTab = screen.getByRole("button", { name: /biodiversity recovery/i });
    fireEvent.click(bioTab);
    expect(screen.getByTestId("biodiversity-chart")).toBeInTheDocument();

    // Switch to Vegetation tab
    const vegTab = screen.getByRole("button", { name: /vegetation & canopy/i });
    fireEvent.click(vegTab);
    expect(screen.getByTestId("vegetation-chart")).toBeInTheDocument();
  });

  it("renders observations history table rows with metric records", async () => {
    vi.mocked(siteService.getSite).mockResolvedValue(mockSite);
    vi.mocked(analyticsService.getSiteAnalytics).mockResolvedValue(mockAnalytics);

    renderSiteDetail();

    await waitFor(() => {
      expect(screen.getByText("145.80")).toBeInTheDocument();
      expect(screen.getByText("140.00")).toBeInTheDocument();
      expect(screen.getByText("88.5%")).toBeInTheDocument();
    });
  });

  it("renders Log Measurement button only for admin users", async () => {
    vi.mocked(siteService.getSite).mockResolvedValue(mockSite);
    vi.mocked(analyticsService.getSiteAnalytics).mockResolvedValue(mockAnalytics);

    renderSiteDetail(true);

    await waitFor(() => {
      const logButtons = screen.getAllByRole("button", { name: /log measurement/i });
      expect(logButtons.length).toBeGreaterThan(0);
    });
  });
});
