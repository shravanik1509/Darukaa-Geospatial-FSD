import { describe, it, expect } from "vitest";
import {
  formatNumber,
  formatHectares,
  formatDate,
  formatDateTime,
} from "../utils/formatters";

describe("Formatters Utility", () => {
  it("formats numbers with specified decimals", () => {
    expect(formatNumber(1250.456, 2)).toBe("1,250.46");
    expect(formatNumber(0, 0)).toBe("0");
    expect(formatNumber(null)).toBe("—");
    expect(formatNumber(undefined)).toBe("—");
  });

  it("formats hectares with ha unit suffix", () => {
    expect(formatHectares(2350.5)).toBe("2,350.50 ha");
    expect(formatHectares(0)).toBe("0.00 ha");
    expect(formatHectares(null)).toBe("0 ha");
    expect(formatHectares(undefined)).toBe("0 ha");
  });

  it("formats date strings into clean human readable format", () => {
    const result = formatDate("2024-06-15");
    expect(result).toContain("Jun");
    expect(result).toContain("2024");
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
  });

  it("formats datetime strings into human readable date and time", () => {
    const result = formatDateTime("2024-06-15T14:30:00Z");
    expect(result).toContain("2024");
    expect(formatDateTime(null)).toBe("—");
  });
});
