// Entry point: routing, rendering and event wiring.
//
// Each page is a function in js/views/ that returns an HTML string. The whole
// page area is re-rendered whenever the route or the saved progress changes.

import { store } from "./store.js";
import { homeView } from "./views/home.js";
import { calendarView } from "./views/calendar.js";
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

function render() {
  const signedIn = store.signedIn;
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
  const button = event.target.closest("[data-pass]");
  if (button) store.changeLatePasses(Number(button.dataset.pass));
}

async function onSubmit(event) {
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
  const typingScore = document.activeElement && document.activeElement.classList && document.activeElement.classList.contains("score");
  if (!typingScore) render();
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
store.start();
