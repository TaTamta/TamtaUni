// Grade calculation. Problem sets are scored out of 10, exams out of 100.
// Until every part is graded, the total covers only the graded parts.

import { COURSES } from "../data/courses.js";
import { tasksForCourse, isHomework } from "./tasks.js";
import { store } from "../store.js";

const average = (values) => values.reduce((a, b) => a + b, 0) / values.length;

function homeworkPercent(course) {
  const homework = tasksForCourse(course.id).filter(isHomework);
  // Reading responses are complete / not complete, with a fixed number needed.
  if (course.homeworkNeeded) {
    const done = homework.filter((t) => store.isDone(t.id)).length;
    return done ? (Math.min(done, course.homeworkNeeded) / course.homeworkNeeded) * 100 : null;
  }
  let scores = homework.map((t) => store.score(t.id)).filter((v) => v != null);
  if (!scores.length) return null;
  if (course.dropLowestHomework && scores.length > 1) scores = scores.sort((a, b) => a - b).slice(1);
  return average(scores) * 10;
}

export function letterFor(percent) {
  if (percent == null) return "";
  if (percent >= 88) return "A";
  if (percent >= 75) return "B";
  if (percent >= 60) return "C";
  return "Below pass";
}

/** { homework, midterm, final, total, letter, isFinal }; midterm is undefined when the course has none. */
export function gradeFor(courseId) {
  const course = COURSES[courseId];
  const w = course.weights;
  const homework = homeworkPercent(course);
  const midterm = w.midterm ? store.score(`${courseId}-MID`) : undefined;
  const final = store.score(`${courseId}-FIN`);

  const parts = [[homework, w.homework], [midterm, w.midterm], [final, w.final]].filter(([value, weight]) => value != null && weight);
  const weightSum = parts.reduce((sum, [, weight]) => sum + weight, 0);
  const total = parts.length ? parts.reduce((sum, [value, weight]) => sum + value * weight, 0) / weightSum : null;
  return { homework, midterm, final, total, letter: letterFor(total), isFinal: final != null };
}

export const formatPercent = (value) => (value == null ? "–" : `${Math.round(value * 10) / 10}%`);
