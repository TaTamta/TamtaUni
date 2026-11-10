// Small HTML-string building blocks shared by the views.

import { COURSES } from "../data/courses.js";
import { DAYS } from "../data/rhythm.js";
import { store } from "../store.js";
import { countsTowardProgress, dueDate, isHomework, isExam, isScored } from "../lib/tasks.js";
import { daysUntil, countdown, formatShort, formatLong } from "../lib/dates.js";

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
export const esc = (text) => String(text).replace(/[&<>"]/g, (c) => ESCAPES[c]);

export const externalLink = (url, label, cls = "") =>
  `<a${cls ? ` class="${cls}"` : ""} href="${url}" target="_blank" rel="noopener">${esc(label)}</a>`;

export const courseCode = (courseId) => `<span class="code c-${courseId}">${COURSES[courseId].code}</span>`;

export const pill = (text, kind = "") => `<span class="pill${kind ? ` ${kind}` : ""}">${esc(text)}</span>`;

export const meter = (percent, courseId = "") =>
  `<div class="meter${courseId ? ` c-${courseId}` : ""}" role="img" aria-label="${percent}% complete"><span style="width:${percent}%"></span></div>`;

export function pageHead(eyebrow, title, lede, courseId = "") {
  return `<div class="head${courseId ? ` c-${courseId}` : ""}"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p class="lede">${lede}</p></div>`;
}

function scoreInput(task) {
  if (!isScored(task)) return "";
  const max = task.type === "PS" ? 10 : 100;
  const value = store.score(task.id);
  const name = `${COURSES[task.courseId].code} ${task.tag}`;
  return `<input class="score" type="number" inputmode="decimal" min="0" max="${max}" step="0.5" id="sc-${task.id}" data-score="${task.id}" value="${value == null ? "" : value}" placeholder="/${max}" aria-label="Score for ${esc(name)} out of ${max}">`;
}

const taskLinks = (task) =>
  task.links.length ? `<span class="tlinks">${task.links.map((l) => externalLink(l.url, `${l.label} ↗`)).join("")}</span>` : "";

/**
 * One checkable task row with its links.
 * opts.course  show the course code
 * opts.meta    "week" | "day" | "due" | "count" (date with a countdown)
 * opts.phase   pass the current phase to flag tasks from past weeks as late
 * opts.score   show the score box for problem sets and exams
 * opts.sub     false hides the secondary line
 */
export function taskRow(task, opts = {}) {
  const course = COURSES[task.courseId];
  const done = store.isDone(task.id);
  let late = Boolean(opts.phase) && !done && countsTowardProgress(task) && task.week < opts.phase.week;
  let meta = "";

  if (opts.meta === "week") meta = `Week ${task.week}`;
  else if (opts.meta === "day") meta = DAYS[task.day].slice(0, 3);
  else if (opts.meta === "due") meta = `Week ${task.week} · ${formatShort(dueDate(task))}`;

  if (opts.meta === "count") {
    const days = daysUntil(dueDate(task));
    meta = done ? "Done" : `${isHomework(task) ? "Due " : ""}${formatLong(dueDate(task))} · ${countdown(days)}`;
    late = !done && days < 0;
  } else if (late) {
    meta = `Late · week ${task.week}`;
  }

  const tags = `${opts.course ? `<b>${course.code}</b>` : ""}<b>${task.tag}</b>`;
  const sub = task.sub && opts.sub !== false ? `<small>${esc(task.sub)}</small>` : "";
  return `<div class="task c-${task.courseId}${done ? " done" : ""}">`
    + `<input type="checkbox" id="cb-${task.id}" data-task="${task.id}"${done ? " checked" : ""}>`
    + `<div class="tl"><label for="cb-${task.id}">${tags}${esc(task.label)}</label>${sub}${taskLinks(task)}</div>`
    + `<span class="meta${late ? " late" : ""}">${esc(meta)}${opts.score ? scoreInput(task) : ""}</span></div>`;
}

export const taskList = (tasks, opts, emptyMessage) =>
  tasks.length ? `<div class="tasks">${tasks.map((t) => taskRow(t, opts)).join("")}</div>` : `<p class="empty">${emptyMessage}</p>`;

/** Calendar chip. `due` marks a homework deadline. Links to the task's first resource. */
export function taskChip(task, due = false) {
  const course = COURSES[task.courseId];
  const text = due ? `${task.tag} due` : isExam(task) ? task.label : task.type === "PR" ? "Practice" : task.tag;
  const cls = `chip c-${task.courseId}${due ? " due" : isExam(task) ? " ex" : ""}${store.isDone(task.id) ? " done" : ""}`;
  const title = esc(`${course.code} ${task.tag} ${task.label}`);
  const url = !isExam(task) && task.links[0] ? task.links[0].url : "";
  return url
    ? `<a class="${cls}" title="${title}" href="${url}" target="_blank" rel="noopener">${esc(text)}</a>`
    : `<span class="${cls}" title="${title}">${esc(text)}</span>`;
}
