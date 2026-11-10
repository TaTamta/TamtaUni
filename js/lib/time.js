// Study-time calculations over the saved sessions. All durations are in minutes.

import { today, addDays } from "./dates.js";

const MINUTE_MS = 60000;
export const HEAT_BLOCK_HOURS = 2;

export const minutesOf = (session) => Math.max(0, (session.end - session.start) / MINUTE_MS);
export const totalMinutes = (sessions) => sessions.reduce((sum, s) => sum + minutesOf(s), 0);

export function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export const sessionsBetween = (sessions, from, to) => sessions.filter((s) => s.start >= from.getTime() && s.start < to.getTime());
export const sessionsThisWeek = (sessions) => sessionsBetween(sessions, startOfWeek(today()), addDays(startOfWeek(today()), 7));
export const sessionsToday = (sessions) => sessionsBetween(sessions, today(), addDays(today(), 1));

/** Map of key → minutes, sorted largest first as [key, minutes] pairs. */
export function minutesBy(sessions, keyOf) {
  const totals = new Map();
  for (const s of sessions) {
    const key = keyOf(s);
    if (key) totals.set(key, (totals.get(key) || 0) + minutesOf(s));
  }
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
}

/** One entry per day for the last `days` days: { date, byCourse: {courseId: minutes}, total }. */
export function dailySeries(sessions, days = 14) {
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(today(), i - (days - 1));
    const daySessions = sessionsBetween(sessions, date, addDays(date, 1));
    const byCourse = {};
    for (const s of daySessions) byCourse[s.courseId] = (byCourse[s.courseId] || 0) + minutesOf(s);
    return { date, byCourse, total: totalMinutes(daySessions) };
  });
}

/** One entry per week (Monday start) for the last `weeks` weeks: { start, total }. */
export function weeklySeries(sessions, weeks = 8) {
  const thisWeek = startOfWeek(today());
  return Array.from({ length: weeks }, (_, i) => {
    const start = addDays(thisWeek, (i - (weeks - 1)) * 7);
    return { start, total: totalMinutes(sessionsBetween(sessions, start, addDays(start, 7))) };
  });
}

/** 7 × 12 grid of minutes: weekday (Monday first) by two-hour block of the day. */
export function heatGrid(sessions) {
  const blocks = 24 / HEAT_BLOCK_HOURS;
  const grid = Array.from({ length: 7 }, () => Array(blocks).fill(0));
  for (const s of sessions) {
    let t = s.start;
    // Walk the session block by block so a long session is split across the blocks it covers.
    while (t < s.end) {
      const at = new Date(t);
      const block = Math.floor(at.getHours() / HEAT_BLOCK_HOURS);
      const blockEnd = new Date(at);
      blockEnd.setHours((block + 1) * HEAT_BLOCK_HOURS, 0, 0, 0);
      const until = Math.min(s.end, blockEnd.getTime());
      grid[(at.getDay() + 6) % 7][block] += (until - t) / MINUTE_MS;
      t = until;
    }
  }
  return grid;
}

/** Headline figures, or null when there are no sessions yet. */
export function summarize(sessions) {
  if (!sessions.length) return null;
  const total = totalMinutes(sessions);
  const longest = sessions.reduce((a, b) => (minutesOf(b) > minutesOf(a) ? b : a));
  const dayKey = (s) => { const d = new Date(s.start); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const activeDays = new Set(sessions.map(dayKey)).size;
  const first = new Date(Math.min(...sessions.map((s) => s.start)));
  const weeksTracked = Math.max(1, Math.ceil((addDays(today(), 1) - startOfWeek(first)) / (7 * 864e5)));

  const grid = heatGrid(sessions);
  const weekdayTotals = grid.map((row) => row.reduce((a, b) => a + b, 0));
  const blockTotals = grid[0].map((_, block) => grid.reduce((sum, row) => sum + row[block], 0));
  const indexOfMax = (values) => values.indexOf(Math.max(...values));

  return {
    total, count: sessions.length, average: total / sessions.length, longest, activeDays, weeksTracked,
    weekdayTotals, weekdayAverages: weekdayTotals.map((m) => m / weeksTracked),
    bestWeekday: indexOfMax(weekdayTotals), bestBlock: indexOfMax(blockTotals), grid,
  };
}

// ---- formatting ----

export function formatDuration(minutes) {
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  return m % 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m / 60} h`;
}
export const formatHours = (minutes) => `${Math.round((minutes / 60) * 10) / 10} h`;
export const formatClock = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};
export const blockLabel = (block) => `${String(block * HEAT_BLOCK_HOURS).padStart(2, "0")}:00–${String((block + 1) * HEAT_BLOCK_HOURS).padStart(2, "0")}:00`;
export const formatTimeOfDay = (ms) => new Date(ms).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
