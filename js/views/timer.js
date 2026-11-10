// Study timer: start and stop a session, log one by hand, review recent sessions.

import { COURSES, COURSE_ORDER } from "../data/courses.js";
import { RHYTHM } from "../data/rhythm.js";
import { SESSION_TYPES, sessionTypeLabel } from "../data/sessionTypes.js";
import { store } from "../store.js";
import { TASKS, tasksInWeek, countsTowardProgress } from "../lib/tasks.js";
import { currentPhase, formatLong } from "../lib/dates.js";
import { sessionsToday, totalMinutes, minutesOf, formatDuration, formatClock, formatTimeOfDay } from "../lib/time.js";
import { esc, pill, courseCode, pageHead } from "../ui/components.js";

const options = (items, selected) => items.map(([value, label]) => `<option value="${esc(value)}"${value === selected ? " selected" : ""}>${esc(label)}</option>`).join("");
const courseOptions = (selected) => options(COURSE_ORDER.map((id) => [id, `${COURSES[id].code} ${COURSES[id].name}`]), selected);
const typeOptions = (selected) => options(SESSION_TYPES.map((t) => [t.id, t.label]), selected);
const tagList = () => `<datalist id="tagList">${store.tags.map((t) => `<option value="${esc(t)}">`).join("")}</datalist>`;
const pad = (n) => String(n).padStart(2, "0");

export function sessionLabel(session) {
  const task = session.taskId && TASKS.find((t) => t.id === session.taskId);
  return [sessionTypeLabel(session.type), task ? `${task.tag} ${task.label}` : "", session.tag ? `#${session.tag}` : ""].filter(Boolean).join(" · ");
}

// Unfinished tasks from this week (and week 1 before the semester starts) to attach a session to.
function taskOptions() {
  const phase = currentPhase();
  const week = phase.phase === "term" ? phase.week : phase.phase === "pre" ? 1 : 0;
  const tasks = (week ? tasksInWeek(week) : []).filter((t) => countsTowardProgress(t) && !store.isDone(t.id));
  const groups = COURSE_ORDER.map((id) => {
    const own = tasks.filter((t) => t.courseId === id);
    return own.length ? `<optgroup label="${COURSES[id].code}">${own.map((t) => `<option value="${t.id}">${esc(`${t.tag} ${t.label}`)}</option>`).join("")}</optgroup>` : "";
  }).join("");
  return `<option value="">Nothing specific</option>${groups}`;
}

function runningPanel(timer) {
  return `<section class="panel c-${timer.courseId}"><div class="ph"><h2>Session running</h2>${pill(`Started ${formatTimeOfDay(timer.start)}`)}</div>`
    + `<div class="clock" data-clock>${formatClock(Date.now() - timer.start)}</div>`
    + `<p class="lede">${courseCode(timer.courseId)} · ${esc(sessionLabel(timer))}</p>`
    + `<div class="actions"><button class="btn primary" id="timer-stop" data-action="timer-stop">Stop and save</button><button class="btn danger" id="timer-discard" data-action="timer-discard">Discard</button></div>`
    + `<p class="empty">The timer keeps running if you close this page or switch device. Sessions under a minute are not saved.</p></section>`;
}

function startPanel() {
  const suggested = RHYTHM[currentPhase().weekday].courseId || "math";
  return `<section class="panel"><div class="ph"><h2>Start a session</h2></div><form id="timerForm"><div class="form">`
    + `<div class="field"><label for="tm-course">Course</label><select id="tm-course" name="courseId">${courseOptions(suggested)}</select></div>`
    + `<div class="field"><label for="tm-type">Doing</label><select id="tm-type" name="type">${typeOptions("lecture")}</select></div>`
    + `<div class="field"><label for="tm-task">Working on (optional)</label><select id="tm-task" name="taskId">${taskOptions()}</select></div>`
    + `<div class="field"><label for="tm-tag">Your tag (optional)</label><input id="tm-tag" name="tag" list="tagList" maxlength="24" placeholder="e.g. cafe, tired, deep focus" autocomplete="off"></div>`
    + `</div>${tagList()}<div class="actions" style="margin-top:12px"><button class="btn primary" id="timer-start" type="submit">Start timer</button></div></form></section>`;
}

function sessionRow(session, withDate) {
  const when = `${withDate ? `${formatLong(new Date(session.start))}, ` : ""}${formatTimeOfDay(session.start)}–${formatTimeOfDay(session.end)}`;
  return `<div class="sess"><div>${courseCode(session.courseId)} ${esc(sessionLabel(session))}<small>${when}</small></div>`
    + `<span class="dur">${formatDuration(minutesOf(session))}</span>`
    + `<button type="button" data-action="session-delete" data-id="${session.id}" aria-label="Delete this session">Delete</button></div>`;
}

function manualPanel() {
  const now = new Date();
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return `<section class="panel"><h2>Add a session by hand</h2><p class="empty">For study time you forgot to track.</p><form id="sessionForm"><div class="form">`
    + `<div class="field"><label for="ms-date">Date</label><input id="ms-date" name="date" type="date" value="${date}" max="${date}" required></div>`
    + `<div class="field"><label for="ms-time">Started at</label><input id="ms-time" name="time" type="time" value="20:00" required></div>`
    + `<div class="field"><label for="ms-min">Minutes</label><input id="ms-min" name="minutes" type="number" min="1" max="720" value="60" required></div>`
    + `<div class="field"><label for="ms-course">Course</label><select id="ms-course" name="courseId">${courseOptions("math")}</select></div>`
    + `<div class="field"><label for="ms-type">Doing</label><select id="ms-type" name="type">${typeOptions("lecture")}</select></div>`
    + `<div class="field"><label for="ms-tag">Your tag (optional)</label><input id="ms-tag" name="tag" list="tagList" maxlength="24" autocomplete="off"></div>`
    + `</div><div class="actions" style="margin-top:12px"><button class="btn" id="session-add" type="submit">Add session</button></div></form></section>`;
}

export function timerView() {
  const todays = sessionsToday(store.sessions);
  const recent = [...store.sessions].sort((a, b) => b.start - a.start).slice(0, 15);
  const hours = RHYTHM[currentPhase().weekday].hours;
  return pageHead("Study time", "Timer", "Time each study session by course and activity. Your sessions feed the charts on the <a href=\"#insights\">Insights</a> page.")
    + (store.timer ? runningPanel(store.timer) : startPanel())
    + `<section class="panel"><div class="ph"><h2>Today</h2>${pill(`${formatDuration(totalMinutes(todays))} of ${hours} h planned`)}</div>`
    + (todays.length ? `<div class="sesslist">${todays.map((s) => sessionRow(s, false)).join("")}</div>` : `<p class="empty">No sessions yet today.</p>`) + `</section>`
    + manualPanel()
    + `<section class="panel"><div class="ph"><h2>Recent sessions</h2>${pill(`${store.sessions.length} in total`)}</div>`
    + (recent.length ? `<div class="sesslist">${recent.map((s) => sessionRow(s, true)).join("")}</div>` : `<p class="empty">Finished sessions appear here.</p>`) + `</section>`;
}
