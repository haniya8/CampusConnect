import type { Activity } from '../types';

const DAY = 86_400_000;

function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function fmtTime(ms: number): string {
  return new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function fmtDay(ms: number, now: number): string {
  const diff = Math.round((startOfDay(ms) - startOfDay(now)) / DAY);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return new Date(ms).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function fmtWhen(ms: number, now: number): string {
  return `${fmtDay(ms, now)}, ${fmtTime(ms)}`;
}

export function activityTitle(a: Pick<Activity, 'title' | 'type'>): string {
  return a.title.trim() || `${a.type} meetup`;
}

/** value for <input type="datetime-local"> */
export function toInputValue(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function fromInputValue(v: string): number {
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? NaN : t;
}

export function minutesOfDay(ms: number): number {
  const d = new Date(ms);
  return d.getHours() * 60 + d.getMinutes();
}

export { startOfDay, DAY };
