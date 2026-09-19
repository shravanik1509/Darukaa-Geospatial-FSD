import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../components/common/Button";
import { Badge, ProjectStatusBadge } from "../components/common/Badge";
import { MetricCard } from "../components/charts/MetricCard";
import { Modal } from "../components/common/Modal";
import { MapboxTokenWarning } from "../components/common/MapboxTokenWarning";
import { TreePine } from "lucide-react";

describe("Common Components", () => {
  describe("Button", () => {
    it("renders text and handles clicks", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      const btn = screen.getByRole("button", { name: /click me/i });
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("displays loading state and is disabled", () => {
      render(<Button isLoading>Submit</Button>);
      const btn = screen.getByRole("button");
      expect(btn).toBeDisabled();
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe("Badge", () => {
    it("renders Badge with children and style classes", () => {
      render(<Badge variant="emerald">Verified Parcel</Badge>);
      expect(screen.getByText("Verified Parcel")).toBeInTheDocument();
    });
  });

  describe("ProjectStatusBadge", () => {
    it("renders status badges with proper labels", () => {
      const { rerender } = render(<ProjectStatusBadge status="Active" />);
      expect(screen.getByText("Active")).toBeInTheDocument();

      rerender(<ProjectStatusBadge status="Planning" />);
      expect(screen.getByText("Planning")).toBeInTheDocument();

      rerender(<ProjectStatusBadge status="Completed" />);
      expect(screen.getByText("Completed")).toBeInTheDocument();
    });
  });

  describe("MetricCard", () => {
    it("renders title, value, unit, and positive trend", () => {
      render(
        <MetricCard
          title="Carbon Stock"
          value="125.4"
          unit="tCO2e/ha"
          changePercentage={12.5}
          icon={<TreePine data-testid="icon" />}
        />
      );
      expect(screen.getByText("Carbon Stock")).toBeInTheDocument();
      expect(screen.getByText("125.4")).toBeInTheDocument();
      expect(screen.getByText("tCO2e/ha")).toBeInTheDocument();
      expect(screen.getByText(/\+12.5%/)).toBeInTheDocument();
    });

    it("renders negative trend percentage", () => {
      render(
        <MetricCard
          title="Deforestation"
          value="4.2"
          changePercentage={-5.8}
          icon={<TreePine />}
        />
      );
      expect(screen.getByText(/-5.8%/)).toBeInTheDocument();
    });
  });

  describe("Modal", () => {
    it("renders modal when open and triggers onClose", () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      expect(screen.getByText("Test Modal")).toBeInTheDocument();
      expect(screen.getByText("Modal content")).toBeInTheDocument();

      // Click close button
      const closeBtn = screen.getByRole("button");
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalled();
    });

    it("does not render when closed", () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()} title="Hidden Modal">
          <p>Hidden</p>
        </Modal>
      );
      expect(screen.queryByText("Hidden Modal")).not.toBeInTheDocument();
    });
  });

  describe("MapboxTokenWarning", () => {
    it("renders warning banner and instructions", () => {
      render(<MapboxTokenWarning />);
      expect(screen.getByText(/Mapbox Access Token Not Configured/i)).toBeInTheDocument();
      expect(screen.getByText(/VITE_MAPBOX_ACCESS_TOKEN/i)).toBeInTheDocument();
    });
  });
});
