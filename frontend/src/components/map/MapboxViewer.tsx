import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { GeoJSONFeatureCollection } from "../../types/site";
import { MapboxTokenWarning } from "../common/MapboxTokenWarning";

interface MapboxViewerProps {
  geojson?: GeoJSONFeatureCollection | null;
  selectedSiteId?: string;
  onSiteClick?: (siteId: string) => void;
  height?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  interactive?: boolean;
}

export const MapboxViewer: React.FC<MapboxViewerProps> = ({
  geojson,
  selectedSiteId,
  onSiteClick,
  height = "480px",
  initialCenter = [-54.95, -3.23], // Default Amazon Basin
  initialZoom = 9,
  interactive = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [styleMode, setStyleMode] = useState<"dark" | "satellite">("dark");

  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const isTokenMissing = !token || token.includes("placeholder") || token.length < 20;

  useEffect(() => {
    if (isTokenMissing || !mapContainer.current) return;

    mapboxgl.accessToken = token;

    const styleUrl =
      styleMode === "satellite"
        ? "mapbox://styles/mapbox/satellite-streets-v12"
        : "mapbox://styles/mapbox/dark-v11";

    const instance = new mapboxgl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: initialCenter,
      zoom: initialZoom,
      interactive: interactive,
    });

    if (interactive) {
      instance.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");
      instance.addControl(new mapboxgl.FullscreenControl(), "top-right");
    }

    instance.on("load", () => {
      setMapLoaded(true);
    });

    map.current = instance;

    return () => {
      instance.remove();
      map.current = null;
    };
  }, [isTokenMissing, styleMode]);

  // Update polygon layers when geojson data changes or map loads
  useEffect(() => {
    if (!map.current || !mapLoaded || isTokenMissing) return;

    const currentMap = map.current;

    // Remove existing layers and source if present
    if (currentMap.getLayer("sites-highlight")) currentMap.removeLayer("sites-highlight");
    if (currentMap.getLayer("sites-line")) currentMap.removeLayer("sites-line");
    if (currentMap.getLayer("sites-fill")) currentMap.removeLayer("sites-fill");
    if (currentMap.getSource("sites-source")) currentMap.removeSource("sites-source");

    if (!geojson || !geojson.features || geojson.features.length === 0) return;

    // Add source
    currentMap.addSource("sites-source", {
      type: "geojson",
      data: geojson as any,
    });

    // Add fill layer
    currentMap.addLayer({
      id: "sites-fill",
      type: "fill",
      source: "sites-source",
      paint: {
        "fill-color": [
          "case",
          ["==", ["get", "id"], selectedSiteId || ""],
          "#4ade80",
          "#22c55e",
        ],
        "fill-opacity": [
          "case",
          ["==", ["get", "id"], selectedSiteId || ""],
          0.6,
          0.35,
        ],
      },
    });

    // Add border outline layer
    currentMap.addLayer({
      id: "sites-line",
      type: "line",
      source: "sites-source",
      paint: {
        "line-color": [
          "case",
          ["==", ["get", "id"], selectedSiteId || ""],
          "#86efac",
          "#4ade80",
        ],
        "line-width": [
          "case",
          ["==", ["get", "id"], selectedSiteId || ""],
          3.5,
          2.0,
        ],
      },
    });

    // Cursor pointer on hover
    currentMap.on("mouseenter", "sites-fill", () => {
      currentMap.getCanvas().style.cursor = "pointer";
    });
    currentMap.on("mouseleave", "sites-fill", () => {
      currentMap.getCanvas().style.cursor = "";
    });

    // Popup on click
    currentMap.on("click", "sites-fill", (e) => {
      if (!e.features || e.features.length === 0) return;
      const feature = e.features[0];
      const props = feature.properties || {};

      if (onSiteClick && props.id) {
        onSiteClick(props.id);
      }

      new mapboxgl.Popup({ offset: 12 })
        .setLngLat(e.lngLat)
        .setHTML(
          `<div style="font-family: inherit;">
            <div style="font-weight: 700; font-size: 14px; color: #f8fafc; margin-bottom: 2px;">
              ${props.name || "Conservation Site"}
            </div>
            <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
              ${props.project_name || "Project"} • <span style="color: #4ade80;">${props.ecosystem_type || "Forest"}</span>
            </div>
            <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 8px;">
              Area: <strong>${props.area_hectares || 0} ha</strong>
            </div>
            <a href="/sites/${props.id}" style="display: block; text-align: center; background: #16a34a; color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; text-decoration: none;">
              Open Detailed Analytics →
            </a>
          </div>`
        )
        .addTo(currentMap);
    });

    // Fit map bounds to contain all polygons
    try {
      const bounds = new mapboxgl.LngLatBounds();
      let hasCoords = false;

      geojson.features.forEach((feature) => {
        if (feature.geometry && feature.geometry.coordinates) {
          feature.geometry.coordinates[0].forEach((coord: number[]) => {
            bounds.extend(coord as [number, number]);
            hasCoords = true;
          });
        }
      });

      if (hasCoords) {
        currentMap.fitBounds(bounds, { padding: 50, maxZoom: 14 });
      }
    } catch {
      // ignore empty bounds
    }
  }, [geojson, mapLoaded, selectedSiteId]);

  if (isTokenMissing) {
    return (
      <div style={{ height }} className="flex flex-col items-center justify-center">
        <MapboxTokenWarning />
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-inner" style={{ height }}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Layer switcher control */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-1 shadow-md">
        <button
          onClick={() => setStyleMode("dark")}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
            styleMode === "dark"
              ? "bg-brand-600 text-white"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Vector Dark
        </button>
        <button
          onClick={() => setStyleMode("satellite")}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
            styleMode === "satellite"
              ? "bg-brand-600 text-white"
              : "text-slate-300 hover:text-white"
          }`}
        >
          Satellite
        </button>
      </div>
    </div>
  );
};
