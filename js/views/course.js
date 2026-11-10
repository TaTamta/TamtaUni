// Course page: overview, OpenCourseWare resources, lectures, homework, exams.

import { COURSES } from "../data/courses.js";
import { store } from "../store.js";
import { tasksForCourse, isHomework } from "../lib/tasks.js";
import { currentPhase } from "../lib/dates.js";
import { courseProgress } from "../lib/progress.js";
import { gradeFor, formatPercent } from "../lib/grades.js";
import { esc, pill, meter, taskList, externalLink, pageHead } from "../ui/components.js";

const doneCount = (tasks) => tasks.filter((t) => store.isDone(t.id)).length;
const note = (text) => (text ? `<p class="empty">${esc(text)}</p>` : "");

export function courseView(courseId) {
  const course = COURSES[courseId];
  const phase = currentPhase();
  const tasks = tasksForCourse(courseId);
  const lectures = tasks.filter((t) => t.type === "L");
  const homework = tasks.filter(isHomework);
  const exams = tasks.filter((t) => t.type === "EX" || t.type === "PR");
  const progress = courseProgress(courseId);
  const grade = gradeFor(courseId);
  const homeworkTitle = course.homework.type === "RR" ? "Reading responses" : "Problem sets";

  return pageHead(`<span class="code">${course.code}</span> · ${course.term} · ${course.role}`, esc(course.name), esc(course.about), courseId)
    + `<div class="grid2"><section class="panel c-${courseId}"><div class="ph"><h2>Progress</h2>${pill(grade.total == null ? "No grades yet" : `Current grade ${formatPercent(grade.total)}`)}</div>`
    + `<div class="stat">${progress.percent}%<small>${progress.done} of ${progress.total} items</small></div>${meter(progress.percent, courseId)}`
    + `<dl class="kv"><dt>Workload</dt><dd>${course.hours} hours a week</dd><dt>Taught by</dt><dd>${esc(course.teachers)}</dd><dt>Prerequisite</dt><dd>${esc(course.prerequisite)}</dd><dt>Grading</dt><dd>${esc(course.weightsText)}</dd></dl></section>`
    + `<section class="panel"><h2>Resources on MIT OpenCourseWare</h2><div class="links">${externalLink(course.base, "Course home")}${course.resources.map(([label, path]) => externalLink(course.base + path, label)).join("")}</div>`
    + `<h3>How to study it</h3><p class="lede">${esc(course.howToStudy)}</p></section></div>`
    + `<section class="panel"><div class="ph"><h2>Lectures</h2>${pill(`${doneCount(lectures)} of ${lectures.length} watched`)}</div>${taskList(lectures, { meta: "week", phase }, "")}${note(course.lecturesNote)}</section>`
    + `<section class="panel"><div class="ph"><h2>${homeworkTitle}</h2>${pill(`${doneCount(homework)} of ${homework.length} done`)}</div>${taskList(homework, { meta: "due", score: true, phase }, "")}${note(course.homeworkNote)}</section>`
    + `<section class="panel"><h2>Exams</h2>${taskList(exams, { meta: "due", score: true, phase }, "")}</section>`;
}
