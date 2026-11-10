// Dashboard: tonight's work, deadline countdowns, accountability figures.

import { SEMESTER } from "../config.js";
import { COURSES, COURSE_ORDER } from "../data/courses.js";
import { DAYS, RHYTHM } from "../data/rhythm.js";
import { store } from "../store.js";
import { TASKS, tasksInWeek, tasksForCourse, countsTowardProgress, isHomework, isExam, dueDate } from "../lib/tasks.js";
import { currentPhase, weekRange, daysUntil, countdown, formatLong } from "../lib/dates.js";
import { courseProgress, overdueTasks, studyStreak } from "../lib/progress.js";
import { esc, pill, meter, courseCode, taskList, pageHead } from "../ui/components.js";

const notDone = (t) => !store.isDone(t.id);
const byDueDate = (a, b) => dueDate(a) - dueDate(b);
const lowerFirst = (text) => text.charAt(0).toLowerCase() + text.slice(1);

// The one-line summary under the heading on a study day.
function tonightSentence(todayTasks, rhythm, nextDeadline) {
  const left = todayTasks.filter(notDone);
  const exams = left.filter(isExam);
  const lectures = left.filter((t) => t.type === "L");
  let text;
  if (exams.length) text = `Exam today: ${COURSES[exams[0].courseId].code} ${exams[0].label}. `;
  else if (lectures.length) text = `Tonight: ${COURSES[lectures[0].courseId].code} lecture${lectures.length > 1 ? "s" : ""} ${lectures.map((t) => t.tag).join(" and ")}, ${rhythm.hours} hours. `;
  else if (left.length) text = `Tonight: ${left.map((t) => `${COURSES[t.courseId].code} ${t.tag}`).join(", ")}, ${rhythm.hours} hours. `;
  else if (todayTasks.length) text = "Today's work is done. ";
  else text = `Tonight: ${rhythm.courseId ? `${COURSES[rhythm.courseId].code} ` : ""}${lowerFirst(rhythm.text)}, ${rhythm.hours} hours. `;

  if (nextDeadline && nextDeadline !== exams[0]) {
    const name = isExam(nextDeadline) ? nextDeadline.label : nextDeadline.tag;
    text += `${COURSES[nextDeadline.courseId].code} ${name} is ${isHomework(nextDeadline) ? "due " : ""}${countdown(daysUntil(dueDate(nextDeadline)))}.`;
  }
  return text;
}

function heading(phase, todayTasks, rhythm, overdue, nextDeadline) {
  let title, sub, status = "";
  if (phase.phase === "pre") {
    title = "Semester 1 starts Monday 16 November";
    sub = `${phase.daysToStart} ${phase.daysToStart === 1 ? "day" : "days"} to go. Your first lecture is 6.042J L1 on Monday night. Week 1 is below.`;
    status = pill("Not started");
  } else if (phase.phase === "break") {
    title = "Break week";
    sub = "No new work until Monday 4 January. Catch up on anything late, or rest.";
  } else if (phase.phase === "done") {
    title = "Semester 1 is over";
    sub = "Do the one-hour review with Claude, then confirm Semester 2 on the Roadmap page.";
    status = pill("Complete", "good");
  } else {
    title = `${DAYS[phase.weekday]}, week ${phase.week} of ${SEMESTER.weeks}`;
    sub = tonightSentence(todayTasks, rhythm, nextDeadline);
  }
  if (phase.phase === "term" || phase.phase === "break") {
    status = overdue.length ? pill(`${overdue.length} late`, overdue.length > 6 ? "crit" : "warn") : pill("On track", "good");
  }
  return pageHead(`${SEMESTER.name} · ${SEMESTER.label}`, `${title} ${status}`, esc(sub));
}

function statsPanel(phase, weekTasks, overdue) {
  const inTerm = phase.phase === "term";
  const done = weekTasks.filter((t) => store.isDone(t.id)).length;
  const percent = weekTasks.length ? Math.round((done / weekTasks.length) * 100) : 0;
  const streak = studyStreak();
  const nextExam = TASKS.filter((t) => isExam(t) && notDone(t) && daysUntil(dueDate(t)) >= 0).sort(byDueDate)[0];
  const streakNote = streak.countedToday ? "Counted for today." : inTerm ? "Tick one item today to keep it." : "Starts with your first tick.";
  return `<section class="panel"><div class="stats">`
    + `<div><span class="eyebrow">${phase.phase === "pre" ? "Week 1" : "This week"}</span><div class="stat">${done}<small>of ${weekTasks.length} done</small></div>${meter(percent)}</div>`
    + `<div><span class="eyebrow">Study streak</span><div class="stat">${streak.length}<small>${streak.length === 1 ? "day" : "days"}</small></div><p class="empty">${streakNote}</p></div>`
    + `<div><span class="eyebrow">Late</span><div class="stat">${overdue.length}<small>${overdue.length === 1 ? "item" : "items"}</small></div><p class="empty">${store.latePassesLeft} of ${SEMESTER.latePasses} late passes left.</p></div>`
    + `<div><span class="eyebrow">Next exam</span>${nextExam
      ? `<div class="stat">${daysUntil(dueDate(nextExam))}<small>days</small></div><p class="empty">${courseCode(nextExam.courseId)} ${esc(nextExam.label)}, ${formatLong(dueDate(nextExam))}</p>`
      : `<p class="empty">No exams left.</p>`}</div>`
    + `</div></section>`;
}

function tonightPanel(phase, todayTasks, rhythm, overdue) {
  const inTerm = phase.phase === "term";
  let html = `<section class="panel"><div class="ph"><h2>${inTerm ? "Tonight" : "Today"}</h2>${inTerm ? pill(`${rhythm.hours} hours`) : ""}</div>`;
  if (inTerm) {
    html += `<p class="lede">${rhythm.courseId ? `${courseCode(rhythm.courseId)} · ` : ""}${esc(rhythm.text)}</p>`
      + taskList(todayTasks, { course: true }, "Nothing new is scheduled tonight. Use the time for the current problem set.");
  } else if (phase.phase === "pre") {
    html += `<p class="lede">Optional warm-up before week 1: set up Python from the 6.0002 software page, and skim the 6.042J syllabus.</p>`;
  } else {
    html += `<p class="empty">No scheduled work.</p>`;
  }
  if (overdue.length && phase.phase !== "pre") {
    html += `<h3>Late</h3>${taskList(overdue.slice(0, 6), { course: true, phase, sub: false }, "")}`;
    if (overdue.length > 6) html += `<p class="empty">And ${overdue.length - 6} more on the <a href="#schedule">Schedule</a>.</p>`;
  }
  return `${html}</section>`;
}

function courseCard(courseId) {
  const course = COURSES[courseId];
  const progress = courseProgress(courseId);
  const next = tasksForCourse(courseId).find((t) => countsTowardProgress(t) && notDone(t));
  return `<a class="panel course-card c-${courseId}" href="#${courseId}"><div class="ph"><span class="code">${course.code}</span>${pill(`${course.hours} h/week`)}</div>`
    + `<h2>${esc(course.name)}</h2><div class="stat">${progress.percent}%<small>${progress.done} of ${progress.total}</small></div>${meter(progress.percent, courseId)}`
    + `<p class="empty">${next ? `Next: ${next.tag} ${esc(next.label)}` : "All done"}</p></a>`;
}

export function homeView() {
  const phase = currentPhase();
  const inTerm = phase.phase === "term";
  const week = phase.phase === "pre" ? 1 : inTerm ? phase.week : 0;
  const weekTasks = week ? tasksInWeek(week) : [];
  const todayTasks = inTerm ? weekTasks.filter((t) => t.day === phase.weekday) : [];
  const rhythm = RHYTHM[phase.weekday];
  const overdue = overdueTasks(phase);
  const deadlines = TASKS.filter((t) => (isHomework(t) || isExam(t)) && notDone(t)).sort(byDueDate);
  const nextDeadline = deadlines.find((t) => daysUntil(dueDate(t)) >= 0);

  return heading(phase, todayTasks, rhythm, overdue, nextDeadline)
    + statsPanel(phase, weekTasks, overdue)
    + `<div class="grid2">${tonightPanel(phase, todayTasks, rhythm, overdue)}`
    + `<section class="panel"><div class="ph"><h2>Deadlines and exams</h2><a href="#calendar">Calendar</a></div>${taskList(deadlines.slice(0, 6), { course: true, meta: "count", sub: false }, "No deadlines left.")}</section></div>`
    + `<section class="panel"><div class="ph"><h2>${phase.phase === "pre" ? "Week 1 preview" : "This week"}</h2>${week ? pill(weekRange(week)) : ""}</div>${taskList(weekTasks, { course: true, meta: "day", sub: false }, "No scheduled work this week.")}</section>`
    + `<div class="grid3">${COURSE_ORDER.map(courseCard).join("")}</div>`;
}
