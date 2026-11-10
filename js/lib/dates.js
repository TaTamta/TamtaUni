// Date helpers for the semester calendar. Weeks are numbered 1…SEMESTER.weeks,
// with one unnumbered break week after SEMESTER.breakAfterWeek.

import { SEMESTER } from "../config.js";

const DAY_MS = 864e5;

export const SEMESTER_START = new Date(...SEMESTER.start);

export function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export const formatShort = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
export const formatLong = (d) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

// Calendar weeks between the semester start and the Monday of study week `week`.
const weekOffset = (week) => (week <= SEMESTER.breakAfterWeek ? week - 1 : week);

/** Date of a day (Monday = 0) in a study week. */
export const weekDate = (week, day) => addDays(SEMESTER_START, weekOffset(week) * 7 + day);

export const weekRange = (week) => `${formatShort(weekDate(week, 0))} – ${formatShort(weekDate(week, 6))}`;

/** Date of a day in the break week. */
export const breakDate = (day) => addDays(SEMESTER_START, SEMESTER.breakAfterWeek * 7 + day);

export const breakRange = () => `${formatShort(breakDate(0))} – ${formatShort(breakDate(6))}`;

/** Whole days from today until `date` (negative when it has passed). */
export const daysUntil = (date) => Math.round((date - today()) / DAY_MS);

export function countdown(days) {
  if (days < 0) return `${-days} ${days === -1 ? "day" : "days"} late`;
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}

/**
 * Where today falls in the semester.
 * phase: "pre" | "term" | "break" | "done"; week is comparable across phases
 * (0 before the start, breakAfterWeek + 0.5 in the break, weeks + 1 after the end);
 * weekday is Monday = 0.
 */
export function currentPhase() {
  const t = today();
  const weekday = (t.getDay() + 6) % 7;
  const daysIn = Math.round((t - SEMESTER_START) / DAY_MS);
  if (daysIn < 0) return { phase: "pre", week: 0, weekday, daysToStart: -daysIn };
  const offset = Math.floor(daysIn / 7);
  if (offset === SEMESTER.breakAfterWeek) return { phase: "break", week: SEMESTER.breakAfterWeek + 0.5, weekday };
  if (offset > SEMESTER.weeks) return { phase: "done", week: SEMESTER.weeks + 1, weekday };
  return { phase: "term", week: offset < SEMESTER.breakAfterWeek ? offset + 1 : offset, weekday };
}
