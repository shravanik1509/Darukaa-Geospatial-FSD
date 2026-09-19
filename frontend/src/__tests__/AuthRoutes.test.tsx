import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../routes/AppRoutes";
import { AuthContext } from "../context/AuthContext";

// Mock child pages to isolate route guard tests
vi.mock("../pages/LoginPage", () => ({
  LoginPage: () => <div data-testid="login-page">Login Page Component</div>,
}));

vi.mock("../pages/RegisterPage", () => ({
  RegisterPage: () => <div data-testid="register-page">Register Page Component</div>,
}));

vi.mock("../pages/DashboardPage", () => ({
  DashboardPage: () => <div data-testid="dashboard-page">Dashboard Page Component</div>,
}));

vi.mock("../pages/CreateSitePage", () => ({
  CreateSitePage: () => <div data-testid="create-site-page">Create Site Page Component</div>,
}));

vi.mock("../layouts/DashboardLayout", async () => {
  const { Outlet } = await vi.importActual<any>("react-router-dom");
  return {
    DashboardLayout: () => (
      <div data-testid="dashboard-layout">
        <Outlet />
      </div>
    ),
  };
});

vi.mock("../layouts/AuthLayout", () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-layout">{children}</div>
  ),
}));

describe("AppRoutes and Route Guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithAuth = (
    initialRoute: string,
    authOverrides: {
      user?: any;
      token?: string | null;
      isAuthenticated?: boolean;
      isAdmin?: boolean;
      isLoading?: boolean;
    } = {}
  ) => {
    const authContextValue = {
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      ...authOverrides,
    };

    return render(
      <AuthContext.Provider value={authContextValue}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <AppRoutes />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it("renders LoginPage when navigating to /login", () => {
    renderWithAuth("/login");
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });

  it("renders RegisterPage when navigating to /register", () => {
    renderWithAuth("/register");
    expect(screen.getByTestId("register-page")).toBeInTheDocument();
  });

  it("redirects unauthenticated user from /dashboard to /login", () => {
    renderWithAuth("/dashboard", { isAuthenticated: false });
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("dashboard-page")).not.toBeInTheDocument();
  });

  it("renders DashboardPage for authenticated user on /dashboard", () => {
    renderWithAuth("/dashboard", {
      isAuthenticated: true,
      user: { id: "usr-1", email: "user@darukaa.earth", role: "ANALYST" } as any,
    });
    expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
  });

  it("allows Admin user to access admin-only site creation route", () => {
    renderWithAuth("/projects/proj-1/sites/new", {
      isAuthenticated: true,
      isAdmin: true,
      user: { id: "usr-admin", email: "admin@darukaa.earth", role: "ADMIN" } as any,
    });
    expect(screen.getByTestId("create-site-page")).toBeInTheDocument();
  });

  it("redirects non-admin Analyst user away from admin-only route to /dashboard", () => {
    renderWithAuth("/projects/proj-1/sites/new", {
      isAuthenticated: true,
      isAdmin: false,
      user: { id: "usr-analyst", email: "analyst@darukaa.earth", role: "ANALYST" } as any,
    });
    expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
    expect(screen.queryByTestId("create-site-page")).not.toBeInTheDocument();
  });

  it("shows authenticating session spinner when authentication is loading", () => {
    renderWithAuth("/dashboard", { isLoading: true });
    expect(screen.getByText(/authenticating session/i)).toBeInTheDocument();
  });
});
