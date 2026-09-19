export type ProjectStatus = "Active" | "Planning" | "Completed" | "Under Review";

export type ProjectType =
  | "Reforestation"
  | "Afforestation"
  | "Mangrove Restoration"
  | "Agroforestry"
  | "Peatland Rewetting"
  | "Grassland Conservation";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  project_type: ProjectType;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  target_carbon_offset: number | null;
  created_by: string | null;
  total_sites: number;
  total_area_hectares: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreatePayload {
  name: string;
  description?: string;
  project_type: ProjectType;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  target_carbon_offset?: number;
}

export interface ProjectUpdatePayload {
  name?: string;
  description?: string;
  project_type?: ProjectType;
  status?: ProjectStatus;
  start_date?: string;
  end_date?: string;
  target_carbon_offset?: number;
}
