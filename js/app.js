// Entry point: routing, rendering and event wiring.
//
// Each page is a function in js/views/ that returns an HTML string. The whole
// page area is re-rendered whenever the route or the saved progress changes.

import { store } from "./store.js";
import { homeView } from "./views/home.js";
import { calendarView } from "./views/calendar.js";
import { timerView, sessionLabel } from "./views/timer.js";
import { insightsView } from "./views/insights.js";
import { COURSES } from "./data/courses.js";
import { formatClock } from "./lib/time.js";
import { scheduleView, currentWeekAnchor } from "./views/schedule.js";
import { courseView } from "./views/course.js";
import { homeworkView } from "./views/homework.js";
import { examsView } from "./views/exams.js";
import { gradesView } from "./views/grades.js";
import { roadmapView } from "./views/roadmap.js";
import { rulesView } from "./views/rules.js";
import { loginView, LOGIN_ERRORS } from "./views/login.js";

// Route name (the part after # in the address) → [nav label, view function].
const ROUTES = {
  home: ["Dashboard", homeView],
  calendar: ["Calendar", calendarView],
  timer: ["Timer", timerView],
  insights: ["Insights", insightsView],
  schedule: ["Schedule", scheduleView],
  math: ["6.042J", () => courseView("math")],
  comp: ["6.0002", () => courseView("comp")],
  brain: ["9.13", () => courseView("brain")],
  homework: ["Homework", homeworkView],
  exams: ["Exams", examsView],
  grades: ["Grades", gradesView],
  roadmap: ["Roadmap", roadmapView],
  rules: ["Rules", rulesView],
};

const SYNC_TEXT = {
  cloud: "Progress saved to your account",
  saving: "Saving…",
  local: "Offline. Progress saved on this device",
};

const $ = (id) => document.getElementById(id);
const main = $("main");

function currentRoute() {
  const name = location.hash.replace("#", "");
  return ROUTES[name] ? name : "home";
}

function renderSyncStatus() {
  $("sync").dataset.s = store.syncStatus;
  $("syncText").textContent = SYNC_TEXT[store.syncStatus];
}

// Updates the running clock in the header and on the Timer page, once a second.
function renderClock() {
  const timer = store.signedIn ? store.timer : null;
  $("running").hidden = !timer;
  if (!timer) return;
  const clock = formatClock(Date.now() - timer.start);
  $("runningText").textContent = `${COURSES[timer.courseId].code} ${clock}`;
  $("running").title = sessionLabel(timer);
  document.querySelectorAll("[data-clock]").forEach((el) => { el.textContent = clock; });
}

function render() {
  const signedIn = store.signedIn;
  renderClock();
  $("sync").hidden = !signedIn;
  $("signout").hidden = !signedIn;
  renderSyncStatus();

  if (!signedIn) {
    $("nav").innerHTML = "";
    main.innerHTML = loginView();
    return;
  }

  // Keep keyboard focus on the same control across the re-render.
  const focusedId = document.activeElement && document.activeElement.id;
  const route = currentRoute();
  $("nav").innerHTML = Object.entries(ROUTES)
    .map(([name, [label]]) => `<a href="#${name}"${name === route ? ' aria-current="page"' : ""}>${label}</a>`)
    .join("");
  main.innerHTML = ROUTES[route][1]();
  if (focusedId) {
    const el = $(focusedId);
    if (el) el.focus({ preventScroll: true });
  }
}

function showLoginError(kind) {
  const el = $("lerr");
  if (!el) return;
  el.textContent = LOGIN_ERRORS[kind];
  el.hidden = false;
}

function onChange(event) {
  const target = event.target;
  if (target.dataset.task) {
    store.setDone(target.dataset.task, target.checked);
  } else if (target.dataset.score) {
    const raw = target.value.trim();
    if (raw === "" || Number.isNaN(Number(raw))) {
      store.setScore(target.dataset.score, null);
    } else {
      const value = Math.max(0, Math.min(Number(target.max), Number(raw)));
      target.value = value;
      store.setScore(target.dataset.score, value);
      // If the page was not re-rendered (focus is still in a score box), tick the row by hand.
      const checkbox = $(`cb-${target.dataset.score}`);
      if (checkbox && !checkbox.checked) { checkbox.checked = true; checkbox.closest(".task").classList.add("done"); }
    }
  }
}

function onClick(event) {
  const pass = event.target.closest("[data-pass]");
  if (pass) { store.changeLatePasses(Number(pass.dataset.pass)); return; }

  const action = event.target.closest("[data-action]");
  if (!action) return;
  if (action.dataset.action === "timer-stop") store.stopTimer();
  else if (action.dataset.action === "timer-discard") { if (confirm("Discard this session without saving it?")) store.discardTimer(); }
  else if (action.dataset.action === "session-delete") { if (confirm("Delete this session?")) store.deleteSession(action.dataset.id); }
}

const formValues = (form) => Object.fromEntries(new FormData(form).entries());

function startTimerFromForm(form) {
  const v = formValues(form);
  // A chosen task decides the course, so the two can't disagree.
  const courseId = v.taskId ? v.taskId.split("-")[0] : v.courseId;
  store.startTimer({ courseId, type: v.type, tag: v.tag.trim(), taskId: v.taskId });
}

function addSessionFromForm(form) {
  const v = formValues(form);
  const start = new Date(`${v.date}T${v.time}`).getTime();
  const minutes = Number(v.minutes);
  if (Number.isNaN(start) || !(minutes > 0)) return;
  store.addSession({ courseId: v.courseId, type: v.type, tag: v.tag.trim(), start, end: start + minutes * 60000 });
}

async function onSubmit(event) {
  if (event.target.id === "timerForm") { event.preventDefault(); startTimerFromForm(event.target); return; }
  if (event.target.id === "sessionForm") { event.preventDefault(); addSessionFromForm(event.target); return; }
  if (event.target.id !== "loginForm") return;
  event.preventDefault();
  $("lbtn").disabled = true;
  $("lerr").hidden = true;
  const result = await store.signIn($("lu").value.trim(), $("lp").value);
  if (result !== "ok") {
    $("lbtn").disabled = false;
    showLoginError(result);
  }
}

function onStoreChange(reason) {
  if (reason === "sync") { renderSyncStatus(); return; }
  if (reason === "login-expired") { showLoginError("expired"); return; }
  // Don't rebuild the page under someone typing a score.
  const active = document.activeElement;
  const typingScore = active && active.classList && active.classList.contains("score");
  // A sync from another device must not wipe a half-filled timer form either.
  const fillingForm = reason === "remote" && active && active.closest && active.closest("form");
  if (!typingScore && !fillingForm) render();
}

main.addEventListener("change", onChange);
main.addEventListener("click", onClick);
main.addEventListener("submit", onSubmit);
$("signout").addEventListener("click", () => store.signOut());
window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
store.subscribe(onStoreChange);

render();
if (store.signedIn && currentRoute() === "schedule") {
  const anchor = currentWeekAnchor();
  if (anchor && $(anchor)) $(anchor).scrollIntoView();
}
setInterval(renderClock, 1000);
store.start();
