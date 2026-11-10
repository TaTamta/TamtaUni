// Planned semesters. Semesters after the first are proposals.

export const ROADMAP = [
  {
    name: "Semester 1", dates: "Nov 2026 – Mar 2027", status: "In progress",
    courses: [["6.042J", "Mathematics for Computer Science"], ["6.0002", "Computational Thinking and Data Science"], ["9.13", "The Human Brain"]],
  },
  {
    name: "Semester 2", dates: "Apr – Aug 2027", status: "Proposed",
    courses: [["6.006", "Introduction to Algorithms (Spring 2020)"], ["18.06SC", "Linear Algebra (Fall 2011)"], ["15.401", "Finance Theory I (Fall 2008), lectures only"]],
  },
  {
    name: "Semester 3", dates: "Sep 2027 – Jan 2028", status: "Proposed",
    courses: [["18.05", "Introduction to Probability and Statistics (Spring 2022)"], ["6.034", "Artificial Intelligence (Fall 2010)"], ["14.01", "Principles of Microeconomics (Fall 2018)"]],
  },
];

export const GATES = [
  "Start 6.006 only after passing 6.042J with a C or better. It needs the proofs, graphs and asymptotics from 6.042J.",
  "If 6.042J is not passed, Semester 2 becomes: finish 6.042J, 18.06SC, and the light course.",
  "Semester 2 has two full-size serious courses, so expect about 20 weeks at 16 hours a week.",
  "Later options: 6.046J Design and Analysis of Algorithms after 6.006, and 6.036 Introduction to Machine Learning after 18.06SC and 18.05.",
  "Check that each course edition is still listed on OCW before a semester starts. The Semester 2 and 3 courses have not been re-checked.",
];

export const RULES = [
  ["Attempt before asking.", "Spend at least 30 minutes on a problem before asking Claude for a hint, and ask for hints before solutions."],
  ["Minimum week.", "In a bad week, do 5 hours: one 6.042J lecture, one 6.0002 lecture, and one honest attempt at the current 6.042J problem set. A minimum week still counts as attended."],
  ["Falling behind.", "If you are more than one week behind in 6.042J, shift the whole schedule back a week. Do not cram two weeks into one."],
  ["What to drop first.", "Pause 9.13 first, then 6.0002. 6.042J is the core course and the last one to pause."],
  ["Break week.", "28 December to 3 January has no new work."],
  ["Exams are real.", "Timed, in one sitting, phone away. Grade them the same day."],
  ["End of semester.", "After week 17, do a one-hour review with Claude: grades, what worked, what to change, and the course choices for Semester 2."],
];
