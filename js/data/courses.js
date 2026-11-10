// Course catalogue for the running semester.
//
// Each course lists its lectures, homework and exams with the week they fall in
// and the exact MIT OpenCourseWare page for each item. To change the plan, edit
// this file only: the schedule, calendar, course pages and grades all read from it.
//
// Days are Monday = 0 … Sunday = 6. Resource paths are relative to `base`.

const OCW = "https://ocw.mit.edu/courses/";

const MATH_BASE = OCW + "6-042j-mathematics-for-computer-science-fall-2010/";
const COMP_BASE = OCW + "6-0002-introduction-to-computational-thinking-and-data-science-fall-2016/";
const BRAIN_BASE = OCW + "9-13-the-human-brain-spring-2019/";

const lecture = (n, title, slug, extra = {}) => ({ n, title, path: `resources/${slug}/`, ...extra });

const math = {
  id: "math",
  code: "6.042J",
  name: "Mathematics for Computer Science",
  term: "Fall 2010",
  role: "Serious · math and proofs",
  hours: 8,
  base: MATH_BASE,
  about: "Builds the math and proof skills every later algorithms course assumes: proofs and induction, number theory, graphs, sums and asymptotics, recurrences, counting, and probability.",
  teachers: "Tom Leighton, Marten van Dijk",
  prerequisite: "Single-variable calculus. No proof experience assumed.",
  howToStudy: "One or two lectures a week, the matching textbook chapter, and a problem set most weeks. Attempt every problem alone first, then have Claude grade your written solutions out of 10.",
  weightsText: "Problem sets 30% (lowest dropped), midterm 30%, final 40%",
  weights: { homework: 30, midterm: 30, final: 40 },
  dropLowestHomework: true,
  resources: [
    ["Video lectures", "video_galleries/video-lectures/"],
    ["Textbook chapters", "pages/readings/"],
    ["Problem sets", "pages/assignments/"],
    ["Recitations", "pages/recitations/"],
    ["Exams and solutions", "pages/exams/"],
    ["Syllabus", "pages/syllabus/"],
  ],
  lectureDays: [0, 2],
  lectures: [
    lecture(1, "Introduction and proofs", "lecture-1-introduction-and-proofs"),
    lecture(2, "Induction", "lecture-2-induction"),
    lecture(3, "Strong induction", "lecture-3-strong-induction"),
    lecture(4, "Number theory I", "lecture-4-number-theory-i"),
    lecture(5, "Number theory II", "lecture-5-number-theory-ii"),
    lecture(6, "Graph theory and coloring", "lecture-6-graph-theory-and-coloring"),
    lecture(7, "Matching problems", "lecture-7-matching-problems"),
    lecture(8, "Graph theory II: minimum spanning trees", "lecture-8-graph-theory-ii-minimum-spanning-trees"),
    lecture(9, "Communication networks", "lecture-9-communication-networks"),
    lecture(10, "Graph theory III", "lecture-10-graph-theory-iii"),
    lecture(11, "Relations, partial orders, and scheduling", "lecture-11-relations-partial-orders-and-scheduling"),
    lecture(12, "Sums", "lecture-12-sums"),
    lecture(13, "Sums and asymptotics", "lecture-13-sums-and-asymptotics"),
    lecture(14, "Divide and conquer recurrences", "lecture-14-divide-and-conquer-recurrences"),
    lecture(15, "Linear recurrences", "lecture-15-linear-recurrences"),
    lecture(16, "Counting rules I", "lecture-16-counting-rules-i"),
    lecture(17, "Counting rules II", "lecture-17-counting-rules-ii"),
    lecture(18, "Probability introduction", "lecture-18-probability-introduction"),
    lecture(19, "Conditional probability", "lecture-19-conditional-probability"),
    lecture(20, "Independence", "lecture-20-independence"),
    lecture(21, "Random variables", "lecture-21-random-variables"),
    lecture(22, "Expectation I", "lecture-22-expectation-i"),
    lecture(23, "Expectation II", "lecture-23-expectation-ii"),
    lecture(24, "Large deviations", "lecture-24-large-deviations"),
    lecture(25, "Random walks", "lecture-25-random-walks"),
  ],
  // week → lecture numbers watched that week
  lectureWeeks: { 1: [1], 2: [2, 3], 3: [4], 4: [5, 6], 5: [7], 6: [8, 9], 7: [10, 11], 8: [12, 13], 9: [14], 10: [15], 11: [16, 17], 12: [18], 13: [19, 20], 14: [21, 22], 15: [23, 24], 16: [25] },
  homework: {
    type: "PS",
    workDay: 5,
    linkLabel: "Problem set (PDF)",
    // [number, due week]; all twelve follow the same file naming on OCW
    items: [[1, 2], [2, 3], [3, 4], [4, 6], [5, 7], [6, 8], [7, 9], [8, 11], [9, 12], [10, 13], [11, 14], [12, 15]].map(([n, week]) => ({
      n,
      week,
      title: `Problem set ${n}`,
      path: `resources/mit6_042jf10_assn${String(n).padStart(2, "0")}/`,
    })),
  },
  extras: [
    {
      id: "PR1", type: "PR", week: 9, day: 6, label: "Midterm practice problems",
      links: [["Practice problems (PDF)", "resources/mit6_042jf10_mid_practice/"], ["Solutions", "resources/mit6_042jf10_mid_pctce_sol/"]],
    },
    {
      id: "MID", type: "EX", week: 10, day: 5, label: "Midterm",
      sub: "2 hours, timed, closed book. The real Fall 2010 midterm. Open it on exam day only.",
      links: [["Exam paper (PDF)", "resources/mit6_042jf10_midterm/"], ["Solutions", "resources/mit6_042jf10_midterm_sol/"]],
    },
    {
      id: "PR2", type: "PR", week: 16, day: 5, label: "Practice finals (2004, 2006)",
      links: [
        ["2004 final", "resources/mit6_042jf10_final_2004/"], ["2004 solutions", "resources/mit6_042jf10_fnl_2004_sol/"],
        ["2006 final", "resources/mit6_042jf10_final_2006/"], ["2006 solutions", "resources/mit6_042jf10_fnl_2006_sol/"],
      ],
    },
    {
      id: "FIN", type: "EX", week: 17, day: 5, label: "Final exam",
      sub: "3 hours, timed, closed book. The 2008 final. Open it on exam day only.",
      links: [["Exam paper (PDF)", "resources/mit6_042jf10_final_2008/"], ["Solutions", "resources/mit6_042jf10_fnl_2008_sol/"]],
    },
  ],
};

const comp = {
  id: "comp",
  code: "6.0002",
  name: "Introduction to Computational Thinking and Data Science",
  term: "Fall 2016",
  role: "Serious · Python problem solving",
  hours: 5,
  base: COMP_BASE,
  about: "Model real problems in Python: optimization, graph models, randomness and simulation, statistics on real data, and a first taste of machine learning.",
  teachers: "John Guttag, Eric Grimson",
  prerequisite: "6.0001-level Python: functions, lists and dictionaries, classes, recursion.",
  howToStudy: "One lecture a week, then run and change the lecture code. One problem set every two weeks. OCW publishes no solutions or final, so Claude reviews your code out of 10 and writes your final.",
  weightsText: "Problem sets 60%, final 40%",
  weights: { homework: 60, midterm: 0, final: 40 },
  resources: [
    ["Lecture videos", "video_galleries/lecture-videos/"],
    ["Slides and code files", "pages/lecture-slides-and-files/"],
    ["Problem sets", "pages/assignments/"],
    ["Style guide (PDF)", "resources/mit6_0002f16_styleguide/"],
    ["Readings", "pages/readings/"],
    ["Software setup", "pages/software/"],
    ["Syllabus", "pages/syllabus/"],
  ],
  lectureDays: [1, 1],
  lectures: [
    lecture(1, "Introduction and optimization problems", "lecture-1-introduction-and-optimization-problems", { reading: "Guttag Ch. 12.1, 5.4" }),
    lecture(2, "Optimization problems", "lecture-2-optimization-problems", { reading: "Guttag Ch. 13" }),
    lecture(3, "Graph-theoretic models", "lecture-3-graph-theoretic-models", { reading: "Guttag Ch. 12.2" }),
    lecture(4, "Stochastic thinking", "lecture-4-stochastic-thinking", { reading: "Guttag Ch. 14" }),
    lecture(5, "Random walks", "lecture-5-random-walks", { reading: "Guttag Ch. 11, 14" }),
    lecture(6, "Monte Carlo simulation", "lecture-6-monte-carlo-simulation", { reading: "Guttag Ch. 15.1–15.4, 16" }),
    lecture(7, "Confidence intervals", "lecture-7-confidence-intervals", { reading: "Guttag Ch. 16.4, 17" }),
    lecture(8, "Sampling and standard error", "lecture-8-sampling-and-standard-error", { reading: "Guttag Ch. 17" }),
    lecture(9, "Understanding experimental data", "lecture-9-understanding-experimental-data", { reading: "Guttag Ch. 18" }),
    lecture(10, "Understanding experimental data (cont.)", "lecture-10-understanding-experimental-data-cont", { reading: "Guttag Ch. 18" }),
    lecture(11, "Introduction to machine learning", "lecture-11-introduction-to-machine-learning", { reading: "Guttag Ch. 22" }),
    lecture(12, "Clustering", "lecture-12-clustering", { reading: "Guttag Ch. 23" }),
    lecture(13, "Classification", "lecture-13-classification", { reading: "Guttag Ch. 24" }),
    lecture(14, "Classification and statistical sins", "lecture-14-classification-and-statistical-sins", { reading: "Guttag Ch. 21" }),
    lecture(15, "Statistical sins and wrap up", "lecture-15-statistical-sins-and-wrap-up", { reading: "Guttag Ch. 21" }),
  ],
  lectureWeeks: { 1: [1, 2], 2: [3], 3: [4], 4: [5], 5: [6], 6: [7], 7: [8], 8: [9], 9: [10], 10: [11], 11: [12], 12: [13], 13: [14, 15] },
  homework: {
    type: "PS",
    workDay: 3,
    linkLabel: "Problem set files (ZIP)",
    items: [
      { n: 1, week: 2, title: "Space Cows Transportation", path: "resources/ps1/" },
      { n: 2, week: 4, title: "Fastest Way to Get Around MIT", path: "resources/ps2/" },
      { n: 3, week: 6, title: "Robot Simulation", path: "resources/ps3/" },
      { n: 4, week: 8, title: "Simulating the Spread of Disease and Bacteria Population", path: "resources/ps4/" },
      { n: 5, week: 11, title: "Modeling Global Warming", path: "resources/ps5/" },
    ],
  },
  extras: [
    { id: "FIN", type: "EX", week: 14, day: 3, label: "Final exam", sub: "2 hours, open book and notes, no internet. Written by Claude." },
  ],
  homeworkNote: "If PS1 feels impossible because of the Python itself, pause this course for two weeks and review classes and recursion first.",
};

const brain = {
  id: "brain",
  code: "9.13",
  name: "The Human Brain",
  term: "Spring 2019",
  role: "Light · curiosity",
  hours: 3,
  base: BRAIN_BASE,
  about: "How the brain implements vision, navigation, number, music, language and thinking about other minds.",
  teachers: "Nancy Kanwisher",
  prerequisite: "Intro psychology or neuroscience. You can start without it; review the visual pathway from retina to cortex in week 2.",
  howToStudy: "One lecture a week, plus a reading response on a research paper in marked weeks. To pass: all lectures, at least 4 reading responses, and both quizzes.",
  weightsText: "Reading responses 40% (4 needed), midterm quiz 20%, final quiz 40%",
  weights: { homework: 40, midterm: 20, final: 40 },
  homeworkNeeded: 4,
  resources: [
    ["Lecture videos", "video_galleries/lecture-videos/"],
    ["Lecture slides", "pages/lecture-notes/"],
    ["Readings", "pages/readings/"],
    ["Assignments", "pages/assignments/"],
    ["Calendar", "pages/calendar/"],
    ["Syllabus", "pages/syllabus/"],
  ],
  lectureDays: [4, 6],
  lectures: [
    lecture(1, "Introduction", "lecture-1-introduction"),
    lecture(2, "Neuroanatomy", "lecture-2-neuroanatomy"),
    lecture(4, "Cognitive neuroscience methods I", "lecture-4-cognitive-neuroscience-methods-i"),
    lecture(5, "Cognitive neuroscience methods II", "lecture-5-cognitive-neuroscience-methods-ii"),
    lecture(7, "Category selectivity, controversies, and MVPA", "lecture-7-category-selectivity-controversies-and-mvpa"),
    lecture(8, "Navigation I", "lecture-8-navigation-i"),
    lecture(9, "Navigation II", "lecture-9-navigation-ii"),
    lecture(10, "Development, nature and nurture I", "lecture-10-development-nature-nurture-i"),
    lecture(11, "Development, nature and nurture II", "lecture-11-development-nature-nurture-ii-2018"),
    lecture(13, "Number", "lecture-13-number"),
    lecture(15, "Hearing and speech", "lecture-15-hearing-and-speech"),
    lecture(16, "Music", "lecture-16-music"),
    lecture(18, "Language I", "lecture-18-language-i"),
    lecture(20, "Mentalizing and theory of mind", "lecture-20-mentalizing-theory-of-mind"),
    lecture(21, "Brain networks", "lecture-21-brain-networks"),
    // Lecture 23 is not in OCW's video gallery listing, so it links to the gallery.
    { n: 23, title: "Deep networks", path: "video_galleries/lecture-videos/", linkLabel: "Find it in the video gallery" },
    lecture(24, "Attention and awareness", "lecture-24-attention-and-awareness"),
  ],
  lectureWeeks: { 1: [1], 2: [2], 3: [4], 4: [5], 5: [7], 6: [8], 7: [9], 8: [10], 9: [11], 11: [13], 12: [15, 16], 13: [18], 14: [20], 15: [21, 23], 16: [24] },
  lecturesNote: "Lectures 3, 12, 14, 17, 19, 22 and 25 were discussions, guest sessions or not recorded, so they are skipped. Lecture 6 (Experimental design) is an optional class discussion.",
  homework: {
    type: "RR",
    workDay: 6,
    linkLabel: "Assignment and paper",
    // Reading response 6 belongs to a lecture with no video, so it is left out.
    items: [[1, 2], [2, 4], [3, 5], [4, 6], [5, 8], [7, 11], [8, 12]].map(([n, week]) => ({
      n,
      week,
      title: `Reading response ${n}`,
      path: `pages/assignments/assignment-${n}/`,
    })),
  },
  extras: [
    { id: "MID", type: "EX", week: 11, day: 6, label: "Midterm quiz", sub: "30 minutes on lectures 1–11. Written by Claude." },
    { id: "FIN", type: "EX", week: 17, day: 6, label: "Final quiz", sub: "45 minutes on lectures 13–24. Written by Claude." },
  ],
  homeworkNote: "At least 4 of these are needed to pass. Each paper takes 2 hours or more to read properly.",
};

export const COURSES = { math, comp, brain };
export const COURSE_ORDER = ["math", "comp", "brain"];
