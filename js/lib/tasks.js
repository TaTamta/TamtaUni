// Turns the course catalogue into one flat list of tasks: every lecture,
// homework item, practice set and exam, each with its week, day and links.
//
// Task ids (for example "math-L4", "comp-PS2", "brain-RR1", "math-MID") are the
// keys progress is saved under, so keep them stable.

import { SEMESTER } from "../config.js";
import { COURSES, COURSE_ORDER } from "../data/courses.js";
import { weekDate } from "./dates.js";

function buildCourseTasks(course) {
  const tasks = [];
  const id = course.id;
  const link = (label, path) => ({ label, url: course.base + path });

  for (const [week, numbers] of Object.entries(course.lectureWeeks)) {
    numbers.forEach((n, index) => {
      const lec = course.lectures.find((l) => l.n === n);
      tasks.push({
        id: `${id}-L${n}`, courseId: id, type: "L", n, tag: `L${n}`,
        label: lec.title, sub: lec.reading || "",
        week: Number(week), day: course.lectureDays[Math.min(index, course.lectureDays.length - 1)],
        links: [link(lec.linkLabel || "Watch lecture", lec.path)],
      });
    });
  }

  const hw = course.homework;
  for (const item of hw.items) {
    tasks.push({
      id: `${id}-${hw.type}${item.n}`, courseId: id, type: hw.type, n: item.n, tag: `${hw.type}${item.n}`,
      label: item.title, sub: "", week: item.week, day: hw.workDay,
      links: [link(hw.linkLabel, item.path)],
    });
  }

  for (const extra of course.extras) {
    tasks.push({
      id: `${id}-${extra.id}`, courseId: id, type: extra.type, tag: extra.type === "EX" ? "EXAM" : "PREP",
      label: extra.label, sub: extra.sub || "", week: extra.week, day: extra.day,
      links: (extra.links || []).map(([label, path]) => link(label, path)),
    });
  }
  return tasks;
}

const order = (t) => COURSE_ORDER.indexOf(t.courseId);
const typeRank = { L: 0, PS: 1, RR: 1, PR: 2, EX: 3 };

export const TASKS = COURSE_ORDER.flatMap((id) => buildCourseTasks(COURSES[id])).sort(
  (a, b) => a.week - b.week || order(a) - order(b) || typeRank[a.type] - typeRank[b.type] || (a.n || 0) - (b.n || 0),
);

/** Homework (problem sets, reading responses) is due on the Sunday of its week. */
export const isHomework = (task) => task.type === "PS" || task.type === "RR";
export const isExam = (task) => task.type === "EX";
/** Practice sets are optional and stay out of progress and "late" counts. */
export const countsTowardProgress = (task) => task.type !== "PR";
export const isScored = (task) => task.type === "PS" || task.type === "EX";

/** The date a task is due (homework) or takes place (everything else). */
export const dueDate = (task) => weekDate(task.week, isHomework(task) ? 6 : task.day);

export const tasksInWeek = (week) => TASKS.filter((t) => t.week === week);
export const tasksForCourse = (courseId) => TASKS.filter((t) => t.courseId === courseId);
export const ALL_WEEKS = Array.from({ length: SEMESTER.weeks }, (_, i) => i + 1);
