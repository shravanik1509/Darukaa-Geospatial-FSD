import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { GeoJSONPolygonGeometry } from "../../types/site";
import { MapboxTokenWarning } from "../common/MapboxTokenWarning";
import { formatHectares } from "../../utils/formatters";
import { Button } from "../common/Button";
import { Edit3, RotateCcw, Trash2 } from "lucide-react";

interface MapboxDrawStudioProps {
  onPolygonChange: (geometry: GeoJSONPolygonGeometry | null, areaEstimateHectares: number) => void;
  height?: string;
  initialCenter?: [number, number];
}

// Compute accurate geodesic area in hectares for preview
function computePolygonAreaHectares(coords: number[][]): number {
  if (!coords || coords.length < 3) return 0;
  const radius = 6378137; // Earth's mean radius in meters
  let area = 0;
  const len = coords.length;
  for (let i = 0; i < len; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % len];
    const lambda1 = (p1[0] * Math.PI) / 180;
    const phi1 = (p1[1] * Math.PI) / 180;
    const lambda2 = (p2[0] * Math.PI) / 180;
    const phi2 = (p2[1] * Math.PI) / 180;
    area += (lambda2 - lambda1) * (2 + Math.sin(phi1) + Math.sin(phi2));
  }
  area = (Math.abs(area) * radius * radius) / 2.0;
  return roundTo(area / 10000.0, 2);
}

function roundTo(num: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

export const MapboxDrawStudio: React.FC<MapboxDrawStudioProps> = ({
  onPolygonChange,
  height = "520px",
  initialCenter = [-54.95, -3.23],
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);

  const [hasPolygon, setHasPolygon] = useState(false);
  const [estimatedArea, setEstimatedArea] = useState<number>(0);
  const [vertexCount, setVertexCount] = useState<number>(0);

  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const isTokenMissing = !token || token.includes("placeholder") || token.length < 20;

  useEffect(() => {
    if (isTokenMissing || !mapContainer.current) return;

    mapboxgl.accessToken = token;

    const instance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: initialCenter,
      zoom: 11,
    });

    const drawInstance = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: "draw_polygon",
    });

    instance.addControl(new mapboxgl.NavigationControl(), "top-right");
    instance.addControl(drawInstance, "top-right");

    const handleDrawUpdate = () => {
      const data = drawInstance.getAll();
      if (data.features.length > 0) {
        const feature = data.features[data.features.length - 1];
        if (feature.geometry.type === "Polygon") {
          const coords = feature.geometry.coordinates as number[][][];
          const extRing = coords[0];
          const areaHa = computePolygonAreaHectares(extRing);

          setHasPolygon(true);
          setEstimatedArea(areaHa);
          setVertexCount(extRing.length - 1);

          onPolygonChange(
            {
              type: "Polygon",
              coordinates: coords,
            },
            areaHa
          );
          return;
        }
      }
      setHasPolygon(false);
      setEstimatedArea(0);
      setVertexCount(0);
      onPolygonChange(null, 0);
    };

    instance.on("load", () => {
      instance.on("draw.create", handleDrawUpdate);
      instance.on("draw.update", handleDrawUpdate);
      instance.on("draw.delete", handleDrawUpdate);
    });

    map.current = instance;
    draw.current = drawInstance;

    return () => {
      instance.remove();
      map.current = null;
      draw.current = null;
    };
  }, [isTokenMissing]);

  const handleStartDraw = () => {
    if (draw.current) {
      draw.current.deleteAll();
      draw.current.changeMode("draw_polygon");
      setHasPolygon(false);
      setEstimatedArea(0);
      setVertexCount(0);
      onPolygonChange(null, 0);
    }
  };

  const handleClear = () => {
    if (draw.current) {
      draw.current.deleteAll();
      setHasPolygon(false);
      setEstimatedArea(0);
      setVertexCount(0);
      onPolygonChange(null, 0);
    }
  };

  if (isTokenMissing) {
    return (
      <div style={{ height }} className="flex flex-col items-center justify-center">
        <MapboxTokenWarning />
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-xl" style={{ height }}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Floating Instructions & Live Metrics HUD */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 max-w-sm">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-lg text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
            <Edit3 className="w-4 h-4 text-brand-400" />
            Polygon Drawing Studio
          </div>
          <p className="text-slate-300 leading-relaxed">
            Click points on the map to define the conservation parcel boundaries. Click the initial vertex to close the polygon.
          </p>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-slate-300">
            <span>Vertices: <strong>{vertexCount}</strong></span>
            <span>Calculated Area: <strong className="text-brand-400 font-mono text-sm">{formatHectares(estimatedArea)}</strong></span>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleStartDraw}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Redraw
            </Button>
            {hasPolygon && (
              <Button
                type="button"
                size="sm"
                variant="danger"
                onClick={handleClear}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
