import { Project } from "./project";
import { Site } from "./site";

export interface AnalyticsRecord {
  id: string;
  site_id: string;
  recorded_at: string;
  carbon_value: number;
  biodiversity_value: number;
  vegetation_value: number;
  canopy_cover_percentage?: number | null;
  soil_moisture_percentage?: number | null;
  created_at: string;
}

export interface MetricTrend {
  current: number;
  previous: number | null;
  change_percentage: number | null;
  min: number;
  max: number;
  avg: number;
}

export interface SiteAnalyticsSummary {
  site_id: string;
  site_name: string;
  total_observations: number;
  latest_recorded_at: string | null;
  carbon_trend: MetricTrend | null;
  biodiversity_trend: MetricTrend | null;
  vegetation_trend: MetricTrend | null;
  records: AnalyticsRecord[];
}

export interface ObservationPayload {
  recorded_at: string;
  carbon_value: number;
  biodiversity_value: number;
  vegetation_value: number;
  canopy_cover_percentage?: number;
  soil_moisture_percentage?: number;
}

export interface DashboardSummary {
  total_projects: number;
  total_sites: number;
  total_area_hectares: number;
  total_estimated_carbon: number;
  average_biodiversity_index: number;
  average_vegetation_index: number;
  projects_by_status: Record<string, number>;
  projects_by_type: Record<string, number>;
  recent_projects: Project[];
  featured_sites: Site[];
}
