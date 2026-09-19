export interface GeoJSONPolygonGeometry {
  type: "Polygon";
  coordinates: number[][][];
}

export interface Site {
  id: string;
  project_id: string;
  project_name?: string;
  name: string;
  description: string | null;
  ecosystem_type: string;
  area_hectares: number;
  center_latitude: number | null;
  center_longitude: number | null;
  geometry: GeoJSONPolygonGeometry;
  latest_carbon?: number | null;
  latest_biodiversity?: number | null;
  latest_vegetation?: number | null;
  created_at: string;
  updated_at: string;
}

export interface SiteCreatePayload {
  name: string;
  description?: string;
  ecosystem_type: string;
  geometry: GeoJSONPolygonGeometry;
}

export interface SiteUpdatePayload {
  name?: string;
  description?: string;
  ecosystem_type?: string;
  geometry?: GeoJSONPolygonGeometry;
}

export interface GeoJSONFeature {
  type: "Feature";
  id: string;
  geometry: GeoJSONPolygonGeometry;
  properties: {
    id: string;
    project_id: string;
    project_name?: string;
    name: string;
    description: string | null;
    ecosystem_type: string;
    area_hectares: number;
    center_latitude: number | null;
    center_longitude: number | null;
    latest_carbon?: number | null;
    latest_biodiversity?: number | null;
    latest_vegetation?: number | null;
  };
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}
