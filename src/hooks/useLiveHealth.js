import { useState, useEffect, useCallback } from "react";
import * as Storage from "../storage";
import * as HealthService from "../healthService";

/**
 * useLiveHealth — single source of truth for live health metrics.
 *
 * Returns:
 *   data:    { steps?, kcal?, rhr?, weight? } | null
 *            null means sync is disabled or no data ever fetched
 *   refresh(): force a re-fetch (e.g. after user enables sync in Settings)
 *   clear():   wipe in-memory + cached snapshot (e.g. on disable / delete account)
 *
 * Initial state is hydrated from the Preferences cache so the UI shows the
 * last-known values immediately at app boot instead of flashing empty.
 *
 * Refresh strategy:
 *   - On mount (one read)
 *   - On document visibility change to "visible" (foreground / tab return)
 *   No setInterval; HealthKit data doesn't change second-by-second and polling
 *   wastes battery + obscures the line between "user moved" and "we polled".
 */
export function useLiveHealth() {
  const [data, setData] = useState(() => Storage.getCachedHealthSnapshot());

  const refresh = useCallback(async () => {
    if (!Storage.isHealthSyncEnabled()) return;
    const fresh = await HealthService.fetchTodayMetrics();
    if (!fresh) return;
    setData(prev => {
      const merged = { ...(prev || {}), ...fresh };
      Storage.setCachedHealthSnapshot(merged);
      return merged;
    });
  }, []);

  const clear = useCallback(() => {
    setData(null);
    Storage.setCachedHealthSnapshot(null);
  }, []);

  useEffect(() => {
    refresh();
    if (typeof document === "undefined") return;
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [refresh]);

  return { data, refresh, clear };
}
