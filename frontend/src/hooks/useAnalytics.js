import { useState, useEffect, useCallback } from "react";
import analyticsService from "../services/analyticsService";

const createHook = (fetcher) => (analysisId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    if (!analysisId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetcher(analysisId);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

export const useDashboardOverview = createHook(
  analyticsService.getDashboardOverview,
);
export const useRepositoryAnalytics = createHook(
  analyticsService.getRepositoryAnalytics,
);
export const useContributorAnalytics = createHook(
  analyticsService.getContributorAnalytics,
);
export const useModuleAnalytics = createHook(
  analyticsService.getModuleAnalytics,
);
export const useTimelineAnalytics = createHook(
  analyticsService.getTimelineAnalytics,
);
