// Progress state, sign-in and syncing.
//
// Progress lives in memory, is mirrored to this browser's storage on every
// change, and is saved to the database a moment later. On sign-in and whenever
// the tab regains focus, the newer of the local and database copies wins.

import { STORAGE_KEYS, SEMESTER } from "./config.js";
import { fetchProgress, saveProgress } from "./lib/api.js";
import { MIN_SESSION_MS } from "./data/sessionTypes.js";

const SAVE_DELAY_MS = 700;
const RETRY_DELAY_MS = 2500;
const MAX_RETRIES = 3;
const REFRESH_AFTER_MS = 30000;

// sessions: finished study sessions; timer: the running session, if any; tags: the user's own tags.
const emptyProgress = () => ({ done: {}, scores: {}, late: 0, sessions: [], timer: null, tags: [], updatedAt: 0 });
const newId = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function readJson(key) {
  try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
}
function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable: keep going in memory */ }
}

let progress = { ...emptyProgress(), ...(readJson(STORAGE_KEYS.progress) || {}) };
let login = readJson(STORAGE_KEYS.login);
if (!(login && login.u && login.p)) login = null;

let syncStatus = "local"; // "cloud" | "saving" | "local"
let dirty = false;
let saving = false;
let failures = 0;
let saveTimer = null;
let lastRefresh = 0;
const listeners = new Set();

const notify = (reason) => listeners.forEach((fn) => fn(reason));
function setSync(status) { syncStatus = status; notify("sync"); }
const hasData = () => progress.late > 0 || Object.keys(progress.done).length > 0 || Object.keys(progress.scores).length > 0 || progress.sessions.length > 0 || Boolean(progress.timer);

function changed() {
  progress.updatedAt = Date.now();
  writeJson(STORAGE_KEYS.progress, progress);
  if (login) scheduleSave(SAVE_DELAY_MS);
  notify("progress");
}

function scheduleSave(delay) {
  dirty = true;
  setSync("saving");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, delay);
}

// One save at a time; a change made during a save triggers another afterwards.
async function flush() {
  if (saving || !dirty || !login) return;
  saving = true;
  dirty = false;
  try {
    const ok = await saveProgress(login.u, login.p, progress);
    if (ok !== true) throw new Error("Save rejected");
    failures = 0;
    saving = false;
    if (dirty) scheduleSave(SAVE_DELAY_MS); else setSync("cloud");
  } catch {
    saving = false;
    failures += 1;
    if (failures < MAX_RETRIES) scheduleSave(RETRY_DELAY_MS); else setSync("local");
  }
}

// Take the database copy if it is newer; push ours if ours is newer.
function reconcile(remote) {
  if (remote && (remote.updatedAt || 0) > (progress.updatedAt || 0)) {
    progress = { ...emptyProgress(), ...remote };
    writeJson(STORAGE_KEYS.progress, progress);
    setSync("cloud");
    notify("remote");
  } else if (hasData() && (!remote || (remote.updatedAt || 0) < progress.updatedAt)) {
    scheduleSave(0);
  } else if (!dirty && !saving) {
    setSync("cloud");
  }
}

async function refresh() {
  if (!login) return;
  lastRefresh = Date.now();
  try {
    const remote = await fetchProgress(login.u, login.p);
    if (remote === null) { store.signOut(); notify("login-expired"); return; }
    failures = 0;
    reconcile(remote);
  } catch {
    setSync("local");
  }
}

function rememberTag(tag) {
  if (tag && !progress.tags.includes(tag)) progress.tags.push(tag);
}

export const store = {
  /** Subscribe to changes. The callback gets a reason: "progress", "remote", "sync", "auth" or "login-expired". */
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  get signedIn() { return Boolean(login); },
  get syncStatus() { return syncStatus; },
  get latePassesUsed() { return progress.late || 0; },
  get latePassesLeft() { return SEMESTER.latePasses - (progress.late || 0); },

  isDone: (taskId) => Boolean(progress.done[taskId]),
  /** Timestamps of completed tasks, for the study streak. */
  completionTimes: () => Object.values(progress.done).filter((v) => typeof v === "number" && v > 1),
  score(taskId) { const v = progress.scores[taskId]; return v == null || v === "" ? null : Number(v); },

  setDone(taskId, done) {
    if (done) progress.done[taskId] = Date.now(); else delete progress.done[taskId];
    changed();
  },
  /** Saves a score (or clears it with null). Entering a score also marks the task done. */
  setScore(taskId, value) {
    if (value == null) delete progress.scores[taskId];
    else { progress.scores[taskId] = value; if (!progress.done[taskId]) progress.done[taskId] = Date.now(); }
    changed();
  },
  changeLatePasses(delta) {
    progress.late = Math.max(0, Math.min(SEMESTER.latePasses, (progress.late || 0) + delta));
    changed();
  },

  // ---- study timer ----
  get sessions() { return progress.sessions; },
  get timer() { return progress.timer; },
  get tags() { return progress.tags; },

  /** Starts timing a session: { courseId, type, tag, taskId }. */
  startTimer(fields) {
    progress.timer = { ...fields, start: Date.now() };
    rememberTag(fields.tag);
    changed();
  },
  /** Stops the timer. Returns true if a session was saved (very short ones are dropped). */
  stopTimer() {
    const timer = progress.timer;
    if (!timer) return false;
    const end = Date.now();
    const keep = end - timer.start >= MIN_SESSION_MS;
    if (keep) progress.sessions.push({ id: newId(), courseId: timer.courseId, type: timer.type, tag: timer.tag || "", taskId: timer.taskId || "", start: timer.start, end });
    progress.timer = null;
    changed();
    return keep;
  },
  discardTimer() { progress.timer = null; changed(); },
  /** Adds a finished session by hand: { courseId, type, tag, start, end } with times in ms. */
  addSession(session) {
    progress.sessions.push({ id: newId(), tag: "", taskId: "", ...session });
    progress.sessions.sort((a, b) => a.start - b.start);
    rememberTag(session.tag);
    changed();
  },
  deleteSession(id) {
    progress.sessions = progress.sessions.filter((s) => s.id !== id);
    changed();
  },

  /** Resolves "ok", "wrong" (bad username or password) or "offline". */
  async signIn(username, password) {
    let remote;
    try { remote = await fetchProgress(username, password); } catch { return "offline"; }
    if (remote === null) return "wrong";
    login = { u: username, p: password };
    writeJson(STORAGE_KEYS.login, login);
    lastRefresh = Date.now();
    notify("auth");
    reconcile(remote);
    return "ok";
  },
  signOut() {
    login = null;
    try { localStorage.removeItem(STORAGE_KEYS.login); } catch { /* ignore */ }
    notify("auth");
  },

  /** Call once at startup: loads the database copy and keeps it fresh on tab focus. */
  start() {
    window.addEventListener("focus", () => {
      if (login && !dirty && !saving && Date.now() - lastRefresh > REFRESH_AFTER_MS) refresh();
    });
    if (login) refresh();
  },
};
