// Settings that change between deployments or semesters.

// Supabase project that stores progress. The publishable key is meant to be public.
export const SUPABASE_URL = "https://ahjycywmzhbuvwkymolg.supabase.co";
export const SUPABASE_KEY = "sb_publishable_YYX8iXF7LB0kkzRRoTXVHQ_fJeHkpt0";

// Browser storage keys (a local copy of progress, and the remembered sign-in).
export const STORAGE_KEYS = {
  progress: "tamta-university-progress",
  login: "tamta-university-login",
};

// The running semester. `start` is the Monday of week 1 as [year, monthIndex, day].
// The break is one week with no work, placed after `breakAfterWeek`.
export const SEMESTER = {
  name: "Semester 1",
  label: "16 Nov 2026 – 21 Mar 2027",
  start: [2026, 10, 16],
  weeks: 17,
  breakAfterWeek: 6,
  latePasses: 4,
};
