// Schedule: every week as a checklist, one column per course.

import { SEMESTER } from "../config.js";
import { COURSES, COURSE_ORDER } from "../data/courses.js";
import { store } from "../store.js";
import { tasksInWeek, ALL_WEEKS } from "../lib/tasks.js";
import { currentPhase, weekRange, breakRange } from "../lib/dates.js";
import { pill, taskList, pageHead } from "../ui/components.js";

function weekPanel(week, phase) {
  const tasks = tasksInWeek(week);
  const current = phase.phase === "term" && phase.week === week;
  const done = tasks.filter((t) => store.isDone(t.id)).length;
  const columns = COURSE_ORDER.map((id) => {
    const courseTasks = tasks.filter((t) => t.courseId === id);
    const finished = !courseTasks.length && week > Math.max(...Object.keys(COURSES[id].lectureWeeks).map(Number)) + 1;
    return `<div><h3 class="code c-${id}">${COURSES[id].code}</h3>${taskList(courseTasks, { phase, sub: false }, finished ? "Finished" : "Week off")}</div>`;
  }).join("");
  return `<section class="panel week${current ? " cur" : ""}" id="wk-${week}"><div class="ph"><h2>Week ${week} <span class="eyebrow">${weekRange(week)}</span></h2>`
    + (current ? pill("This week", "now") : pill(`${done} of ${tasks.length}`, done === tasks.length ? "good" : ""))
    + `</div><div class="wkcols">${columns}</div></section>`;
}

function breakPanel(phase) {
  const current = phase.phase === "break";
  return `<section class="panel week${current ? " cur" : ""}" id="wk-break"><div class="ph"><h2>Break <span class="eyebrow">${breakRange()}</span></h2>${current ? pill("This week", "now") : ""}</div><p class="empty">No new work. Catch up or rest.</p></section>`;
}

export function scheduleView() {
  const phase = currentPhase();
  return pageHead(SEMESTER.name, "Schedule", `${SEMESTER.weeks} study weeks at 16 hours a week. Deadlines fall on the Sunday of the week shown. L is a lecture, PS a problem set, RR a reading response.`)
    + ALL_WEEKS.map((week) => weekPanel(week, phase) + (week === SEMESTER.breakAfterWeek ? breakPanel(phase) : "")).join("");
}

/** Id of the panel to scroll to when the schedule opens. */
export function currentWeekAnchor() {
  const phase = currentPhase();
  if (phase.phase === "break") return "wk-break";
  return phase.phase === "term" ? `wk-${phase.week}` : "";
}
