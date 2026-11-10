// What a study session can be spent on. `id` is saved with each session, so keep ids stable.

export const SESSION_TYPES = [
  { id: "lecture", label: "Lecture" },
  { id: "reading", label: "Reading" },
  { id: "problems", label: "Problem set" },
  { id: "review", label: "Review" },
  { id: "exam", label: "Exam prep" },
  { id: "other", label: "Other" },
];

export const sessionTypeLabel = (id) => (SESSION_TYPES.find((t) => t.id === id) || { label: "Other" }).label;

// Sessions shorter than this are treated as accidental starts and not saved.
export const MIN_SESSION_MS = 60 * 1000;
