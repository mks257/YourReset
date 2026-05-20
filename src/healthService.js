import { Capacitor } from "@capacitor/core";
import { Health } from "@capgo/capacitor-health";

const REQUIRED_READ_TYPES = ["steps", "calories", "heartRate", "restingHeartRate", "weight"];

/**
 * Checks if the Capacitor Health plugin is available and running on a native platform (iOS/Android).
 */
export function isPluginAvailable() {
  return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("Health");
}

/**
 * Requests iOS Apple HealthKit / Android Health Connect authorization for the required metrics.
 * @returns {Promise<boolean>} True if authorization requested successfully, false otherwise.
 */
export async function requestAuthorization() {
  if (!isPluginAvailable()) {
    console.log("[HealthService] Native Health plugin not available (Web/Vite mode).");
    return false;
  }
  try {
    const availability = await Health.isAvailable();
    if (!availability.available) {
      console.warn("[HealthService] Health SDK is not compatible/available:", availability.reason);
      return false;
    }
    await Health.requestAuthorization({
      read: REQUIRED_READ_TYPES,
      write: [] // Read-only access to prevent App Store write compliance friction
    });
    console.log("[HealthService] Authorization request completed.");
    return true;
  } catch (err) {
    console.error("[HealthService] Error requesting Health authorization:", err);
    return false;
  }
}

/**
 * Checks if the required health permissions have been authorized.
 * @returns {Promise<boolean>}
 */
export async function checkAuthorization() {
  if (!isPluginAvailable()) return false;
  try {
    const availability = await Health.isAvailable();
    if (!availability.available) return false;
    
    // For @capgo/capacitor-health, checkAuthorization resolves if permissions are healthy
    await Health.checkAuthorization({
      read: REQUIRED_READ_TYPES,
      write: []
    });
    return true;
  } catch (err) {
    console.warn("[HealthService] Authorization check failed (or not fully granted):", err);
    return false;
  }
}

/**
 * Fetches the daily sum for a specific aggregated metric (Steps, Calories).
 * @param {string} dataType 
 * @returns {Promise<number>}
 */
async function getTodaySum(dataType) {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    
    const res = await Health.queryAggregated({
      dataType,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      bucket: "day",
      aggregation: "sum"
    });
    
    return res.samples?.[0]?.value || 0;
  } catch (err) {
    console.warn(`[HealthService] Failed to query today's sum for ${dataType}:`, err);
    return 0;
  }
}

/**
 * Fetches the latest recorded value for non-continuous metrics (Resting HR, Weight, Heart Rate)
 * using a 7-day sliding lookback window to handle days without direct entries.
 * @param {string} dataType 
 * @returns {Promise<number|null>}
 */
async function getLatestValue(dataType) {
  try {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    const end = new Date();
    
    const res = await Health.queryAggregated({
      dataType,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      bucket: "day",
      aggregation: "average"
    });
    
    const samples = res.samples || [];
    // Traverse backwards starting from the most recent day in the 7-day period
    for (let i = samples.length - 1; i >= 0; i--) {
      if (samples[i]?.value) {
        return Math.round(samples[i].value);
      }
    }
    return null;
  } catch (err) {
    console.warn(`[HealthService] Failed to query latest average for ${dataType}:`, err);
    return null;
  }
}

/**
 * Fetches real-time metrics for Today (Steps, Active Calories, Resting HR, Weight).
 * Falls back to null if native syncing is disabled, unauthed, or not available.
 * @returns {Promise<object|null>}
 */
export async function fetchTodayMetrics() {
  if (!isPluginAvailable()) return null;
  
  try {
    const steps = await getTodaySum("steps");
    const kcal = await getTodaySum("calories");
    const rhr = await getLatestValue("restingHeartRate") || await getLatestValue("heartRate");
    const weight = await getLatestValue("weight");
    
    const data = {};
    if (steps > 0) data.steps = Math.round(steps);
    if (kcal > 0) data.kcal = Math.round(kcal);
    if (rhr) data.rhr = rhr;
    if (weight) data.weight = weight;
    
    // If we couldn't fetch any active measurements, return empty to prevent wiping baseline
    if (Object.keys(data).length === 0) return null;
    
    return data;
  } catch (err) {
    console.error("[HealthService] Error fetching today's health metrics:", err);
    return null;
  }
}

/**
 * Fetches the step count daily totals for the last 30 days.
 * Formats the array in thousands (e.g. 5.5 for 5500 steps) to align with MetricsTab.jsx spark-bars.
 * @returns {Promise<number[]|null>}
 */
export async function fetch30DayStepHistory() {
  if (!isPluginAvailable()) return null;
  
  try {
    const start = new Date();
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    
    const res = await Health.queryAggregated({
      dataType: "steps",
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      bucket: "day",
      aggregation: "sum"
    });
    
    const samples = res.samples || [];
    // Map each daily sample to thousands. Pad to at least 30 entries if missing.
    const stepsArray = samples.map(s => (s.value || 0) / 1000);
    
    // If the native stack returned fewer than 30 samples, pad left with 0s
    while (stepsArray.length < 30) {
      stepsArray.unshift(0);
    }
    
    return stepsArray;
  } catch (err) {
    console.error("[HealthService] Error fetching 30-day step history:", err);
    return null;
  }
}
