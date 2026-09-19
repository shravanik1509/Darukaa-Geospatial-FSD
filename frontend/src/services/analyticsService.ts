import { api } from "./api";
import { AnalyticsRecord, DashboardSummary, ObservationPayload, SiteAnalyticsSummary } from "../types/analytics";

export const analyticsService = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await api.get<DashboardSummary>("/dashboard/summary");
    return res.data;
  },

  async getSiteAnalytics(siteId: string): Promise<SiteAnalyticsSummary> {
    const res = await api.get<SiteAnalyticsSummary>(`/sites/${siteId}/analytics`);
    return res.data;
  },

  async addObservation(siteId: string, payload: ObservationPayload): Promise<AnalyticsRecord> {
    const res = await api.post<AnalyticsRecord>(`/sites/${siteId}/analytics`, payload);
    return res.data;
  },
};
