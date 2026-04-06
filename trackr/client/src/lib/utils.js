export const fmt = (n) => (n ?? 0).toLocaleString();
export const fmtTime = (mins) => {
  if (!mins) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
export const dateStr = (d = new Date()) => d.toISOString().split('T')[0];
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
export const fmtDateLong = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
export const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
export const pct = (cur, target) => clamp(Math.round((cur / target) * 100), 0, 100);

export const COLORS = {
  accent: '#7c6fcd',
  orange: '#f97316',
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
  blue: '#3b82f6',
  pink: '#ec4899',
};

export const MOOD_EMOJI = { great: '🔥', good: '😊', okay: '😐', bad: '😕', terrible: '😞' };

export const CATEGORY_COLORS = {
  chest: '#ef4444', back: '#3b82f6', shoulders: '#8b5cf6',
  arms: '#f97316', legs: '#10b981', core: '#f59e0b',
  cardio: '#ec4899', full_body: '#7c6fcd', other: '#9898a6',
};
