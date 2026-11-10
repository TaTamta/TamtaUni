// Roadmap of planned semesters and the gates between them.

import { ROADMAP, GATES } from "../data/roadmap.js";
import { esc, pill, pageHead } from "../ui/components.js";

const semesterCard = (semester, index) =>
  `<section class="panel"><div class="ph"><h2>${semester.name}</h2>${pill(semester.status, index ? "" : "now")}</div><span class="eyebrow">${semester.dates}</span>`
  + `<dl class="kv">${semester.courses.map(([code, name], i) => `<dt class="code">${code}</dt><dd>${esc(name)}${i === 2 ? ` <span class="empty">· light</span>` : ""}</dd>`).join("")}</dl></section>`;

export function roadmapView() {
  return pageHead("Degree plan", "Roadmap", "Math foundations first, then algorithms, then machine learning. Semesters 2 and 3 are proposals to confirm at each end-of-semester review.")
    + `<div class="grid3">${ROADMAP.map(semesterCard).join("")}</div>`
    + `<section class="panel"><h2>Gates</h2><ol class="rules">${GATES.map((g) => `<li>${esc(g)}</li>`).join("")}</ol></section>`;
}
