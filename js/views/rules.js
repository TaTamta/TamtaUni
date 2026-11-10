// Rules, late passes and the weekly rhythm.

import { SEMESTER } from "../config.js";
import { COURSES } from "../data/courses.js";
import { DAYS, RHYTHM } from "../data/rhythm.js";
import { RULES } from "../data/roadmap.js";
import { store } from "../store.js";
import { esc, pill, courseCode, pageHead } from "../ui/components.js";

function latePasses() {
  const used = store.latePassesUsed;
  const dots = Array.from({ length: SEMESTER.latePasses }, (_, i) => `<i class="${i < used ? "used" : ""}"></i>`).join("");
  return `<section class="panel"><div class="ph"><h2>Late passes</h2>${pill(`${store.latePassesLeft} of ${SEMESTER.latePasses} left`)}</div>`
    + `<div class="passes"><div class="dots" role="img" aria-label="${used} of ${SEMESTER.latePasses} late passes used">${dots}</div>`
    + `<button class="btn" id="pass-use" data-pass="1"${used >= SEMESTER.latePasses ? " disabled" : ""}>Use a late pass</button>`
    + `<button class="btn" id="pass-undo" data-pass="-1"${used <= 0 ? " disabled" : ""}>Undo</button></div>`
    + `<p class="empty">Each pass moves one deadline by a week with no penalty.</p></section>`;
}

function rhythmTable() {
  const rows = RHYTHM.map((r, day) =>
    `<tr><td>${DAYS[day]}</td><td class="num">${r.hours}</td><td>${r.courseId ? courseCode(r.courseId) : "All three"}</td><td>${esc(r.text)}</td></tr>`).join("");
  const total = RHYTHM.reduce((sum, r) => sum + r.hours, 0);
  return `<section class="panel"><div class="ph"><h2>Weekly rhythm</h2>${pill(`${total} hours`)}</div><div class="tbl"><table><thead><tr><th>Day</th><th>Hours</th><th>Course</th><th>What</th></tr></thead><tbody>${rows}</tbody></table></div>`
    + `<p class="empty">From week 15, ${COURSES.comp.code} is finished and its ${COURSES.comp.hours} hours go to ${COURSES.math.code} final preparation.</p></section>`;
}

export function rulesView() {
  return pageHead("Handbook", "Rules", "The rules exist to keep the semester alive through bad weeks. Finishing slowly beats quitting.")
    + latePasses()
    + `<section class="panel"><h2>University rules</h2><ol class="rules">${RULES.map(([title, text]) => `<li><strong>${esc(title)}</strong> ${esc(text)}</li>`).join("")}</ol></section>`
    + rhythmTable();
}
