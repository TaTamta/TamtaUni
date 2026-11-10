// Exams and practice material across all courses.

import { TASKS, isExam } from "../lib/tasks.js";
import { currentPhase } from "../lib/dates.js";
import { taskList, pageHead } from "../ui/components.js";

export function examsView() {
  const phase = currentPhase();
  return pageHead("All courses", "Exams", "Exams are timed, in one sitting, phone away, and graded the same day. Enter each score as a percentage. Do not open the 6.042J midterm or final paper before exam day.")
    + `<section class="panel">${taskList(TASKS.filter(isExam), { course: true, meta: "due", score: true, phase }, "")}</section>`
    + `<section class="panel"><h2>Practice material</h2>${taskList(TASKS.filter((t) => t.type === "PR"), { course: true, meta: "week" }, "")}</section>`;
}
