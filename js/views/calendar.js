// Calendar: the current week day by day, then the whole semester as a grid.

import { SEMESTER } from "../config.js";
import { COURSES, COURSE_ORDER } from "../data/courses.js";
import { DAYS, RHYTHM } from "../data/rhythm.js";
import { tasksInWeek, isHomework, ALL_WEEKS } from "../lib/tasks.js";
import { currentPhase, today, weekDate, weekRange, breakDate, formatShort } from "../lib/dates.js";
import { esc, pill, taskList, taskChip, pageHead } from "../ui/components.js";

function dayByDay(phase) {
  const week = phase.phase === "pre" ? 1 : phase.phase === "term" ? phase.week : phase.phase === "break" ? SEMESTER.breakAfterWeek + 1 : SEMESTER.weeks;
  const title = phase.phase === "term" ? "This week" : phase.phase === "done" ? "Final week" : "Next study week";
  const tasks = tasksInWeek(week);
  const todayTime = today().getTime();

  const days = DAYS.map((name, day) => {
    const date = weekDate(week, day);
    const rhythm = RHYTHM[day];
    const due = day === 6 ? tasks.filter(isHomework) : [];
    return `<div class="day${date.getTime() === todayTime ? " today" : ""}">`
      + `<div class="dname">${name} ${formatShort(date)}<small>${rhythm.hours} hours · ${rhythm.courseId ? COURSES[rhythm.courseId].code : "all three"}</small></div>`
      + `<div>${taskList(tasks.filter((t) => t.day === day), { course: true, sub: false }, esc(rhythm.text))}`
      + (due.length ? `<div class="duel">Due by tonight: ${due.map((t) => taskChip(t, true)).join("")}</div>` : "")
      + `</div></div>`;
  }).join("");

  return `<section class="panel"><div class="ph"><h2>${title}, day by day</h2>${pill(`Week ${week} · ${weekRange(week)}`)}</div><div class="days">${days}</div></section>`;
}

// What an otherwise empty grid cell is for, following the weekly rhythm.
function emptyCellNote(week, day) {
  const compFinished = week > Math.max(...Object.keys(COURSES.comp.lectureWeeks).map(Number)) + 1;
  if ((day === 1 || day === 3) && compFinished) return "6.042J final prep";
  if (day === 2) return "Reading, PS start";
  if (day === 3 || day === 5) return "PS work";
  if (day === 6) return "Wrap-up, check-in";
  return "Catch-up";
}

function semesterGrid(phase) {
  const todayTime = today().getTime();

  const cell = (date, inner) => {
    const time = date.getTime();
    const label = date.getDate() === 1 || date.getDay() === 1 ? formatShort(date) : date.getDate();
    return `<div class="cd${time < todayTime ? " past" : ""}${time === todayTime ? " today" : ""}"><span class="dn">${label}</span>${inner}</div>`;
  };
  const row = (label, current, cells) => `<div class="cw${current ? " cur" : ""}">${label}</div>${cells}`;

  const header = `<div class="ch"></div>` + DAYS.map((name, day) => {
    const rhythm = RHYTHM[day];
    return `<div class="ch${rhythm.courseId ? ` c-${rhythm.courseId}` : ""}">${name.slice(0, 3)}<small>${rhythm.courseId ? COURSES[rhythm.courseId].code : "All"} · ${rhythm.hours}h</small></div>`;
  }).join("");

  const breakRow = row("Break", phase.phase === "break",
    DAYS.map((_, day) => cell(breakDate(day), day === 0 ? `<span class="note">Break. No new work.</span>` : "")).join(""));

  const rows = ALL_WEEKS.map((week) => {
    const tasks = tasksInWeek(week);
    const cells = DAYS.map((_, day) => {
      let inner = tasks.filter((t) => t.day === day && !isHomework(t)).map((t) => taskChip(t)).join("");
      if (day === 6) inner += tasks.filter(isHomework).map((t) => taskChip(t, true)).join("");
      return cell(weekDate(week, day), inner || `<span class="note">${emptyCellNote(week, day)}</span>`);
    }).join("");
    return row(`W${week}`, phase.phase === "term" && phase.week === week, cells) + (week === SEMESTER.breakAfterWeek ? breakRow : "");
  }).join("");

  const legend = COURSE_ORDER.map((id) => `<span><span class="chip c-${id}">${COURSES[id].code}</span></span>`).join("")
    + `<span><span class="chip">L4</span> lecture</span><span><span class="chip due">PS2 due</span> deadline</span><span><span class="chip ex">Final exam</span> exam</span>`;

  return `<section class="panel"><div class="ph"><h2>Whole semester</h2>${pill(`${SEMESTER.weeks} weeks + break`)}</div>`
    + `<div class="legend">${legend}</div><div class="tbl"><div class="cal">${header}${rows}</div></div>`
    + `<p class="empty">Tap a lecture or deadline to open it on OpenCourseWare. Scroll sideways on a phone. Finished items fade.</p></section>`;
}

export function calendarView() {
  const phase = currentPhase();
  return pageHead(SEMESTER.name, "Calendar", "Every lecture, deadline and exam by date. Homework is due by the end of Sunday in the week shown.")
    + dayByDay(phase) + semesterGrid(phase);
}
