import { useState, useEffect, useCallback } from "react";
import repositoryService from "../services/repositoryService";

export const useRepository = (analysisId) => {
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
      const res = await repositoryService.getRepository(analysisId);
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load repository.");
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

export const useRepositoryStatus = (
  analysisId,
  { onComplete, onFail } = {},
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!analysisId) return;

    let cancelled = false;
    let timer = null;

    const poll = async () => {
      try {
        const res = await repositoryService.getStatus(analysisId);
        if (cancelled) return;

        setData(res);
        setLoading(false);

        if (res.status === "completed") {
          setPolling(false);
          onComplete?.(res);
        } else if (res.status === "failed") {
          setPolling(false);
          onFail?.(res);
        } else {
          timer = setTimeout(poll, 3000);
        }
      } catch {
        if (!cancelled) {
          timer = setTimeout(poll, 5000);
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [analysisId]);

  return { data, loading, polling };
};

export const useAllRepositories = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await repositoryService.getAllRepositories();
      setData(res?.repositories || res || []);
    } catch (err) {
      setError(err.message || "Failed to load repositories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};
