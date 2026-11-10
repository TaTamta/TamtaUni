// Progress figures derived from the task list and saved state.

import { TASKS, tasksForCourse, countsTowardProgress } from "./tasks.js";
import { today, addDays } from "./dates.js";
import { store } from "../store.js";

export function courseProgress(courseId) {
  const tasks = tasksForCourse(courseId).filter(countsTowardProgress);
  const done = tasks.filter((t) => store.isDone(t.id)).length;
  return { done, total: tasks.length, percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
}

/** Unfinished tasks from weeks before the current one. */
export const overdueTasks = (phase) => TASKS.filter((t) => countsTowardProgress(t) && !store.isDone(t.id) && t.week < phase.week);

/** Consecutive days, ending today or yesterday, with at least one task ticked. */
export function studyStreak() {
  const days = new Set(store.completionTimes().map((time) => { const d = new Date(time); d.setHours(0, 0, 0, 0); return d.getTime(); }));
  const countedToday = days.has(today().getTime());
  let day = countedToday ? today() : addDays(today(), -1);
  let length = 0;
  while (days.has(day.getTime())) { length += 1; day = addDays(day, -1); }
  return { length, countedToday };
}
