import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ProjectsPage } from "../pages/ProjectsPage";
import { projectService } from "../services/projectService";
import { AuthContext } from "../context/AuthContext";

vi.mock("../services/projectService", () => ({
  projectService: {
    listProjects: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
  },
}));

const mockProjects = [
  {
    id: "proj-1",
    name: "Congo Basin Peatlands",
    description: "Protection of primary tropical peat swamp forests in DRC.",
    country: "Democratic Republic of the Congo",
    project_type: "Wetland Restoration",
    status: "ACTIVE" as const,
    target_carbon_offset: 75000,
    total_sites: 2,
    total_area_hectares: 850.5,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "proj-2",
    name: "Sundarbans Mangrove Alliance",
    description: "Coastal mangrove restoration for storm surge protection.",
    country: "India",
    project_type: "Mangrove Conservation",
    status: "PLANNING" as const,
    target_carbon_offset: 30000,
    total_sites: 1,
    total_area_hectares: 400.0,
    created_at: "2026-01-02T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
  },
];

describe("ProjectsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderProjects = (isAdmin = true) => {
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
          <ProjectsPage />
        </BrowserRouter>
      </AuthContext.Provider>
    );
  };

  it("renders projects list with names, countries, and status badges", async () => {
    vi.mocked(projectService.listProjects).mockResolvedValue(mockProjects);

    renderProjects();

    await waitFor(() => {
      expect(screen.getByText("Congo Basin Peatlands")).toBeInTheDocument();
      expect(screen.getByText("Sundarbans Mangrove Alliance")).toBeInTheDocument();
    });

    expect(screen.getByText("Wetland Restoration")).toBeInTheDocument();
    expect(screen.getByText("Mangrove Conservation")).toBeInTheDocument();
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
    expect(screen.getByText("PLANNING")).toBeInTheDocument();
  });

  it("renders empty state message when no projects are returned", async () => {
    vi.mocked(projectService.listProjects).mockResolvedValue([]);

    renderProjects();

    await waitFor(() => {
      expect(screen.getByText(/no projects found/i)).toBeInTheDocument();
    });
  });

  it("triggers search query when typing into search input", async () => {
    vi.mocked(projectService.listProjects).mockResolvedValue(mockProjects);

    renderProjects();

    await waitFor(() => {
      expect(screen.getByText("Congo Basin Peatlands")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search by project name...");
    fireEvent.change(searchInput, { target: { value: "Sundarbans" } });

    await waitFor(() => {
      expect(projectService.listProjects).toHaveBeenCalledWith({
        search: "Sundarbans",
        status: undefined,
      });
    });
  });

  it("displays Create Project button for admin users only", async () => {
    vi.mocked(projectService.listProjects).mockResolvedValue(mockProjects);

    renderProjects(true);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /create project/i })).toBeInTheDocument();
    });
  });
});
