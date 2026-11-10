// The fixed weekly rhythm, Monday first. `courseId` is null on the mixed wrap-up day.

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const RHYTHM = [
  { courseId: "math", hours: 2, text: "Lecture and notes" },
  { courseId: "comp", hours: 2, text: "Lecture, then run and change the lecture code" },
  { courseId: "math", hours: 2, text: "Second lecture, or textbook chapter and problem set start" },
  { courseId: "comp", hours: 2, text: "Problem set" },
  { courseId: "brain", hours: 2, text: "Lecture" },
  { courseId: "math", hours: 3, text: "Problem set" },
  { courseId: null, hours: 3, text: "One hour each: finish the 6.042J problem set, finish 6.0002 work, 9.13 reading response. Then the weekly check-in." },
];
