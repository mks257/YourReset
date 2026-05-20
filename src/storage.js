const P = 'yr_';

export const get = (key, fallback = null) => {
  try {
    const v = localStorage.getItem(P + key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
};

export const set = (key, val) => {
  try { localStorage.setItem(P + key, JSON.stringify(val)); } catch {}
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
  // Avoid duplicates for the same exercise on the same day
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

export const getExerciseHistory = (exerciseId) => {
  const allKeys = Object.keys(localStorage);
  const logPrefix = P + 'log_';
  
  return allKeys
    .filter(k => k.startsWith(logPrefix) && k.endsWith('_' + exerciseId))
    .map(k => {
      const parts = k.split('_'); // [yr, log, weekKey, dayIdx, exId]
      const weekKey = parts[2];
      const data = get(k.replace(P, ''), []);
      return { weekKey, data };
    })
    .sort((a, b) => a.weekKey.localeCompare(b.weekKey));
};
