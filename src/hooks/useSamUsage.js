import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Loads the artist's Sam credit balance (included monthly usage plus any
 * purchased extra credits) from the server, which is the single source of
 * truth for the numbers. Returns refresh() to re-fetch after a task runs.
 */
export default function useSamUsage({ enabled = true } = {}) {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("samUsageStatus");
      setUsage(res.data || null);
    } catch {
      setUsage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (enabled) refresh(); else setLoading(false); }, [enabled, refresh]);

  return { usage, loading, refresh };
}