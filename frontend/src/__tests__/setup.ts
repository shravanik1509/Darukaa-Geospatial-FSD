import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock HTMLCanvasElement for Chart.js
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Array(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => []),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
});

// Mock Mapbox GL JS
vi.mock("mapbox-gl", () => {
  return {
    default: {
      Map: vi.fn(() => ({
        on: vi.fn(),
        remove: vi.fn(),
        addControl: vi.fn(),
        addSource: vi.fn(),
        removeSource: vi.fn(),
        addLayer: vi.fn(),
        removeLayer: vi.fn(),
        getLayer: vi.fn(),
        getSource: vi.fn(),
        fitBounds: vi.fn(),
        getCanvas: vi.fn(() => ({ style: {} })),
      })),
      NavigationControl: vi.fn(),
      FullscreenControl: vi.fn(),
      Popup: vi.fn(() => ({
        setLngLat: vi.fn().mockReturnThis(),
        setHTML: vi.fn().mockReturnThis(),
        addTo: vi.fn().mockReturnThis(),
      })),
      LngLatBounds: vi.fn(() => ({
        extend: vi.fn(),
      })),
      accessToken: "",
    },
  };
});

// Mock Mapbox Draw
vi.mock("@mapbox/mapbox-gl-draw", () => {
  return {
    default: vi.fn(() => ({
      getAll: vi.fn(() => ({ features: [] })),
      deleteAll: vi.fn(),
      changeMode: vi.fn(),
    })),
  };
});
