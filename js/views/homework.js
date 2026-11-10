// Homework across all courses, in due order.

import { store } from "../store.js";
import { TASKS, isHomework } from "../lib/tasks.js";
import { currentPhase } from "../lib/dates.js";
import { pill, taskList, pageHead } from "../ui/components.js";

export function homeworkView() {
  const phase = currentPhase();
  const homework = TASKS.filter(isHomework);
  const open = homework.filter((t) => !store.isDone(t.id));
  const done = homework.filter((t) => store.isDone(t.id));
  const opts = { course: true, meta: "due", score: true };
  return pageHead("All courses", "Homework", "Tick an item when it is submitted and graded. Problem sets are scored out of 10. Attempt each problem for 30 minutes before asking Claude for a hint.")
    + `<section class="panel"><div class="ph"><h2>To do</h2>${pill(`${open.length} left`)}</div>${taskList(open, { ...opts, phase }, "All homework is done.")}</section>`
    + `<section class="panel"><div class="ph"><h2>Done</h2>${pill(String(done.length))}</div>${taskList(done, opts, "Nothing finished yet.")}</section>`;
}
