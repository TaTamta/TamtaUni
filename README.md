# Tamta University

My personal university portal, built on MIT OpenCourseWare.

Live site: https://tatamta.github.io/TamtaUni/

Semester 1 (16 Nov 2026 – 21 Mar 2027):

- 6.042J Mathematics for Computer Science
- 6.0002 Introduction to Computational Thinking and Data Science
- 9.13 The Human Brain

## How it works

A static site with no build step: plain HTML, CSS and JavaScript modules, hosted on GitHub Pages. Progress (ticked items, scores, late passes, timed study sessions) is saved to a Supabase database behind a simple username and password, and mirrored in the browser so the site still works offline.

## Project structure

```
index.html              Page shell: header, nav, main area
css/styles.css          All styling, light and dark themes
js/
  app.js                Entry point: routes, rendering, event handling
  config.js             Supabase address, semester dates and length
  store.js              Progress state, sign-in, saving and syncing
  data/
    courses.js          Courses: lectures, homework, exams, weeks, OCW links
    rhythm.js           What is studied on each day of the week
    sessionTypes.js     Activities a timed study session can have
    roadmap.js          Future semesters, gates and university rules
  lib/
    dates.js            Week and date calculations
    tasks.js            Builds the flat task list from the course data
    progress.js         Course progress, late items, study streak
    grades.js           Grade calculation
    time.js             Study-time totals, heatmap and summaries from timed sessions
    api.js              Calls to the Supabase database functions
  ui/
    components.js       Shared pieces: task rows, chips, pills, meters
    charts.js           Bar charts, column charts and the heatmap
  views/                One file per page (home, calendar, schedule, course, …)
```

## Common changes

| To change… | Edit |
| --- | --- |
| A lecture, problem set, exam, its week or its link | `js/data/courses.js` |
| Semester start date, number of weeks, break week | `js/config.js` |
| Which course is studied on which day | `js/data/rhythm.js` |
| Future semesters or the rules | `js/data/roadmap.js` |
| The activities offered by the timer | `js/data/sessionTypes.js` |
| Grade weights | `weights` in `js/data/courses.js` |
| How a page looks or what it shows | the matching file in `js/views/` |
| Colours, fonts, spacing | the tokens at the top of `css/styles.css` |

Task ids such as `math-L4` or `comp-PS2` are the keys progress is saved under. Renumbering lectures or homework in `courses.js` changes those ids, so already-ticked items would lose their tick.

## Running locally

Modules need to be served over HTTP, so open the folder with any static server:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Database

One Supabase table, `progress`, with one row per user. The site never reads the table directly. It calls two database functions, `get_progress` and `save_progress`, which check the username and password. The key in `js/config.js` is Supabase's publishable key and is safe to commit.

## Credits

Course materials belong to MIT OpenCourseWare. This portal is a personal study plan and is not affiliated with MIT.
