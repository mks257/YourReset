/**
 * storage.js — synchronous wrapper around @capacitor/preferences
 *
 * Why a cache?
 *   Every existing call site (App.jsx, CycleTab, FriendsTab, FuelLog, etc.)
 *   uses synchronous get/set. Capacitor Preferences is async. To avoid
 *   refactoring every component, we hydrate all `yr_`-prefixed keys into an
 *   in-memory Map at boot, and all subsequent reads/writes hit the cache.
 *   Writes also fire-and-forget to Preferences for native persistence.
 *
 * Platform note:
 *   On web (Vite dev / Capacitor browser), @capacitor/preferences uses
 *   localStorage under the hood, so behaviour is identical to the old code.
 *   On iOS / Android native, Preferences uses UserDefaults / SharedPreferences
 *   which survive WebView storage purges.
 *
 * Sensitive data:
 *   Preferences is NOT encrypted at rest beyond OS-level disk encryption.
 *   Do not store auth tokens or HealthKit-sensitive cached values here.
 *   Use @capacitor-community/secure-storage (Keychain) for secrets.
 */

import { Preferences } from '@capacitor/preferences';

const P = 'yr_';
const cache = new Map();
let hydrated = false;
let hydratePromise = null;

/**
 * Hydrate the in-memory cache from Preferences. Call once at app startup
 * before rendering. Idempotent — subsequent calls return the same promise.
 *
 * Also performs a one-time migration: if localStorage contains yr_* keys
 * (from a pre-Preferences build), copy them into Preferences then leave
 * the localStorage values in place for safety.
 */
export async function init() {
  if (hydrated) return;
  if (hydratePromise) return hydratePromise;

  hydratePromise = (async () => {
    // Migration: copy any pre-existing localStorage yr_* keys into Preferences.
    // Safe to run on every boot; Preferences.set is idempotent.
    try {
      if (typeof localStorage !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k || !k.startsWith(P)) continue;
          const existing = await Preferences.get({ key: k });
          if (existing.value === null) {
            const v = localStorage.getItem(k);
            if (v !== null) await Preferences.set({ key: k, value: v });
          }
        }
      }
    } catch { /* localStorage may not exist in some test envs */ }

    // Load all yr_* keys from Preferences into the cache.
    try {
      const { keys } = await Preferences.keys();
      for (const k of keys) {
        if (!k.startsWith(P)) continue;
        const { value } = await Preferences.get({ key: k });
        if (value === null) continue;
        try { cache.set(k, JSON.parse(value)); }
        catch { cache.set(k, value); }
      }
    } catch (err) {
      console.warn('[storage] hydrate failed, starting empty:', err);
    }

    hydrated = true;
  })();

  return hydratePromise;
}

export const isHydrated = () => hydrated;

/**
 * Snapshot every yr_* key in the cache as a plain object, suitable for
 * JSON export ("Export data" in Settings).
 */
export const exportAll = () => {
  const out = {};
  for (const [k, v] of cache.entries()) out[k] = v;
  return out;
};

export const get = (key, fallback = null) => {
  const k = P + key;
  return cache.has(k) ? cache.get(k) : fallback;
};

export const set = (key, val) => {
  const k = P + key;
  cache.set(k, val);
  // Fire-and-forget native write; failure logged but doesn't block UI.
  Preferences.set({ key: k, value: JSON.stringify(val) })
    .catch(err => console.warn(`[storage] set(${key}) failed:`, err));
};

export const remove = (key) => {
  const k = P + key;
  cache.delete(k);
  Preferences.remove({ key: k })
    .catch(err => console.warn(`[storage] remove(${key}) failed:`, err));
};

/**
 * Wipe every yr_* key from cache and Preferences.
 * Used by Settings "Delete account & data" and "Clear all data".
 */
export const clearAll = async () => {
  const keys = [...cache.keys()];
  cache.clear();
  await Promise.allSettled(keys.map(k => Preferences.remove({ key: k })));
  // Also clear any legacy localStorage yr_* keys leftover from migration.
  try {
    if (typeof localStorage !== 'undefined') {
      const lsKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(P)) lsKeys.push(k);
      }
      lsKeys.forEach(k => localStorage.removeItem(k));
    }
  } catch { /* ignore */ }
};

export const getWeekKey = () => {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
};

export const getTodayKey = () => new Date().toISOString().slice(0, 10);

export const getPrevWeekKey = () => {
  const now = new Date();
  now.setDate(now.getDate() - 7);
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
};

export const pushHistory = (item) => {
  const history = get('history', []);
  const id = `${getTodayKey()}_${item.id}`;
  const filtered = history.filter(h => `${h.date}_${h.id}` !== id);
  const newHistory = [{ ...item, date: getTodayKey(), timestamp: Date.now() }, ...filtered].slice(0, 100);
  set('history', newHistory);
};

export const recordSubstitution = (exerciseId) => {
  const counts = get('swap_counts', {});
  counts[exerciseId] = (counts[exerciseId] || 0) + 1;
  set('swap_counts', counts);
};

export const getSubstitutionCount = (exerciseId) => get('swap_counts', {})[exerciseId] || 0;

export const getFuelLog = (date) => get(`fuel_log_${date}`, { meals: [], water: 0 });
export const setFuelLog = (date, log) => set(`fuel_log_${date}`, log);

/**
 * Synchronous lookup over the in-memory cache. Returns all log_<week>_<day>_<exId>
 * entries for a given exercise, sorted ascending by week key.
 */
export const getExerciseHistory = (exerciseId) => {
  const logPrefix = P + 'log_';
  const suffix = '_' + exerciseId;
  const results = [];
  for (const k of cache.keys()) {
    if (k.startsWith(logPrefix) && k.endsWith(suffix)) {
      const parts = k.split('_'); // [yr, log, weekKey, dayIdx, exId]
      const weekKey = parts[2];
      results.push({ weekKey, data: cache.get(k) || [] });
    }
  }
  return results.sort((a, b) => a.weekKey.localeCompare(b.weekKey));
};
