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
