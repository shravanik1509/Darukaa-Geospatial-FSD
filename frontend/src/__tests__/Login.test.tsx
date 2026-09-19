import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { AuthProvider } from "../context/AuthContext";
import { authService } from "../services/authService";

vi.mock("../services/authService", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn().mockResolvedValue(null),
  },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LoginPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

  it("renders email and password inputs and sign-in button", () => {
    renderComponent();

    expect(screen.getByPlaceholderText("you@organization.earth")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("populates admin demo credentials when Admin Demo button is clicked", () => {
    renderComponent();

    const adminDemoBtn = screen.getByRole("button", { name: /admin demo/i });
    fireEvent.click(adminDemoBtn);

    const emailInput = screen.getByPlaceholderText("you@organization.earth") as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;

    expect(emailInput.value).toBe("admin@darukaa.earth");
    expect(passwordInput.value).toBe("Admin@123456");
  });

  it("populates analyst demo credentials when Analyst Demo button is clicked", () => {
    renderComponent();

    const analystDemoBtn = screen.getByRole("button", { name: /analyst demo/i });
    fireEvent.click(analystDemoBtn);

    const emailInput = screen.getByPlaceholderText("you@organization.earth") as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText("••••••••") as HTMLInputElement;

    expect(emailInput.value).toBe("analyst@darukaa.earth");
    expect(passwordInput.value).toBe("Analyst@123456");
  });

  it("submits the credentials and navigates on successful login", async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      access_token: "jwt.token.mock",
      token_type: "bearer",
      user: {
        id: "usr-1",
        email: "admin@darukaa.earth",
        full_name: "Admin User",
        role: "ADMIN",
        is_active: true,
        created_at: "2026-01-01T00:00:00Z",
      },
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText("you@organization.earth");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitBtn = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "admin@darukaa.earth" } });
    fireEvent.change(passwordInput, { target: { value: "Admin@123456" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: "admin@darukaa.earth",
        password: "Admin@123456",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("renders error alert message when login fails", async () => {
    const err: any = new Error("Invalid email or password");
    err.isAxiosError = true;
    err.response = { data: { detail: "Invalid email or password" } };
    vi.mocked(authService.login).mockRejectedValueOnce(err);

    renderComponent();

    const emailInput = screen.getByPlaceholderText("you@organization.earth");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitBtn = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "bad@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "WrongPass" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });
  });
});
