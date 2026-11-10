// Transcript calculated from the scores entered on the Homework and Exams pages.

import { COURSES, COURSE_ORDER } from "../data/courses.js";
import { gradeFor, formatPercent } from "../lib/grades.js";
import { esc, pill, pageHead } from "../ui/components.js";

function row(courseId) {
  const course = COURSES[courseId];
  const g = gradeFor(courseId);
  const letter = g.letter ? pill(g.letter + (g.isFinal ? "" : " so far"), g.letter === "Below pass" ? "crit" : "good") : "–";
  return `<tr class="c-${courseId}"><td><span class="code">${course.code}</span><br>${esc(course.name)}</td>`
    + `<td class="num">${formatPercent(g.homework)}</td><td class="num">${g.midterm === undefined ? "None" : formatPercent(g.midterm)}</td>`
    + `<td class="num">${formatPercent(g.final)}</td><td class="num">${formatPercent(g.total)}</td><td>${letter}</td></tr>`;
}

export function gradesView() {
  return pageHead("Transcript", "Grades", "Grades update from the scores you enter on the Homework and Exams pages. A course is passed at 60% or higher. Until the final is in, the grade covers only what has been graded.")
    + `<section class="panel"><div class="tbl"><table><thead><tr><th>Course</th><th>Homework</th><th>Midterm</th><th>Final</th><th>Current</th><th>Grade</th></tr></thead><tbody>${COURSE_ORDER.map(row).join("")}</tbody></table></div></section>`
    + `<div class="grid2"><section class="panel"><h2>Weights</h2><dl class="kv">${COURSE_ORDER.map((id) => `<dt class="code c-${id}">${COURSES[id].code}</dt><dd>${esc(COURSES[id].weightsText)}</dd>`).join("")}</dl></section>`
    + `<section class="panel"><h2>Scale</h2><dl class="kv"><dt>A</dt><dd>88–100%</dd><dt>B</dt><dd>75–87.9%</dd><dt>C</dt><dd>60–74.9%</dd><dt>Not passed</dt><dd>Below 60%</dd></dl></section></div>`;
}
