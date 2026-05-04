import { toAbsoluteUrl } from "../utils/urlUtils.ts";

export interface VisionUsageSnapshot {
  date: string;
  sessionPagesToday: number;
  sessionDailyLimit: number;
  globalPagesToday: number;
  globalDailyLimit: number;
  costPerPageUsd: number;
  sessionCostTodayUsd: number;
  globalCostTodayUsd: number;
}

export interface CacheInvalidateResult {
  deletedKeys: number;
  message: string;
}

export const adminService = {
  async getVisionUsage(baseUrl: string, sessionId: string): Promise<VisionUsageSnapshot> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (sessionId) headers["X-Session-ID"] = sessionId;

    const url = toAbsoluteUrl(baseUrl, "/admin/vision-usage");
    const res = await fetch(url, { method: "GET", headers });
    if (!res.ok) throw new Error(`Vision usage fetch failed: ${res.status}`);
    return res.json();
  },

  async invalidateCache(baseUrl: string, sessionId: string): Promise<CacheInvalidateResult> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (sessionId) headers["X-Session-ID"] = sessionId;

    const url = toAbsoluteUrl(baseUrl, "/admin/cache/invalidate");
    const res = await fetch(url, { method: "POST", headers });
    if (!res.ok) throw new Error(`Cache invalidate failed: ${res.status}`);
    return res.json();
  },
};
