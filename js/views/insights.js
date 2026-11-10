// Insights: where study time goes, compared with the plan, and when it happens.

import { COURSES, COURSE_ORDER } from "../data/courses.js";
import { DAYS } from "../data/rhythm.js";
import { sessionTypeLabel } from "../data/sessionTypes.js";
import { store } from "../store.js";
import { formatShort, formatLong } from "../lib/dates.js";
import {
  sessionsThisWeek, totalMinutes, minutesBy, minutesOf, dailySeries, weeklySeries, summarize,
  formatDuration, formatHours, blockLabel, HEAT_BLOCK_HOURS,
} from "../lib/time.js";
import { studyStreak } from "../lib/progress.js";
import { esc, pill, courseCode, pageHead } from "../ui/components.js";
import { horizontalBars, columnChart, heatmap, legend, tableView } from "../ui/charts.js";

const PLANNED_WEEK_MINUTES = COURSE_ORDER.reduce((sum, id) => sum + COURSES[id].hours * 60, 0);
const courseLegend = () => legend(COURSE_ORDER.map((id) => ({ courseId: id, label: COURSES[id].code })));
const stat = (label, value, unit, note) =>
  `<div><span class="eyebrow">${label}</span><div class="stat">${value}<small>${unit}</small></div><p class="empty">${note}</p></div>`;

function statsPanel(sessions, summary, week) {
  const streak = studyStreak();
  return `<section class="panel"><div class="stats">`
    + stat("This week", formatHours(totalMinutes(week)).replace(" h", ""), `of ${PLANNED_WEEK_MINUTES / 60} h planned`, `${week.length} ${week.length === 1 ? "session" : "sessions"} since Monday.`)
    + stat("All time", formatHours(summary.total).replace(" h", ""), "hours", `${summary.count} sessions on ${summary.activeDays} ${summary.activeDays === 1 ? "day" : "days"}.`)
    + stat("Average session", Math.round(summary.average), "min", `Longest: ${formatDuration(minutesOf(summary.longest))} on ${formatShort(new Date(summary.longest.start))}.`)
    + stat("Study streak", streak.length, streak.length === 1 ? "day" : "days", "Days in a row with a timed session or a ticked item.")
    + `</div></section>`;
}

function planPanel(week) {
  const rows = COURSE_ORDER.map((id) => {
    const minutes = totalMinutes(week.filter((s) => s.courseId === id));
    return { label: COURSES[id].code, labelHtml: courseCode(id), courseId: id, value: minutes, target: COURSES[id].hours * 60, display: `${formatHours(minutes)} of ${COURSES[id].hours} h` };
  });
  return `<section class="panel"><div class="ph"><h2>This week against the plan</h2>${pill("Marker shows planned hours")}</div>${horizontalBars(rows)}</section>`;
}

function dailyPanel(sessions) {
  const days = dailySeries(sessions, 14);
  const columns = days.map((d) => ({
    label: String(d.date.getDate()),
    title: `${formatLong(d.date)}: ${formatDuration(d.total)}` + COURSE_ORDER.filter((id) => d.byCourse[id]).map((id) => `, ${COURSES[id].code} ${formatDuration(d.byCourse[id])}`).join(""),
    segments: COURSE_ORDER.map((id) => ({ courseId: id, value: d.byCourse[id] || 0 })),
  }));
  const table = tableView(["Day", ...COURSE_ORDER.map((id) => COURSES[id].code), "Total"],
    days.map((d) => [formatLong(d.date), ...COURSE_ORDER.map((id) => formatDuration(d.byCourse[id] || 0)), formatDuration(d.total)]));
  return `<section class="panel"><div class="ph"><h2>Last 14 days</h2>${pill(formatHours(days.reduce((sum, d) => sum + d.total, 0)))}</div>${courseLegend()}${columnChart(columns)}${table}</section>`;
}

function weeklyPanel(sessions) {
  const weeks = weeklySeries(sessions, 8);
  const columns = weeks.map((w) => ({ label: formatShort(w.start), title: `Week of ${formatShort(w.start)}: ${formatHours(w.total)}`, segments: [{ value: w.total }] }));
  return `<section class="panel"><div class="ph"><h2>Week by week</h2>${pill("Last 8 weeks")}</div>${columnChart(columns, { plan: PLANNED_WEEK_MINUTES, planLabel: `Plan ${PLANNED_WEEK_MINUTES / 60} h` })}`
    + tableView(["Week of", "Hours"], weeks.map((w) => [formatShort(w.start), formatHours(w.total)])) + `</section>`;
}

function heatPanel(summary) {
  const colLabels = summary.grid[0].map((_, block) => (block % 2 === 0 ? String(block * HEAT_BLOCK_HOURS).padStart(2, "0") : ""));
  return `<section class="panel"><div class="ph"><h2>When you study</h2>${pill("Darker is more time")}</div>`
    + heatmap(summary.grid, DAYS.map((d) => d.slice(0, 3)), colLabels, (r, c, v) => `${DAYS[r]} ${blockLabel(c)}: ${formatDuration(v)}`)
    + `<p class="empty">Hours of the day run left to right, from midnight.</p></section>`;
}

function weekdayPanel(summary) {
  const rows = DAYS.map((day, i) => ({ label: day.slice(0, 3), value: summary.weekdayAverages[i], display: formatDuration(summary.weekdayAverages[i]) }));
  return `<section class="panel"><div class="ph"><h2>Average per weekday</h2>${pill(`Over ${summary.weeksTracked} ${summary.weeksTracked === 1 ? "week" : "weeks"}`)}</div>${horizontalBars(rows)}</section>`;
}

function breakdownPanel(title, pairs, labelOf, emptyText) {
  const rows = pairs.map(([key, minutes]) => ({ label: labelOf(key), value: minutes, display: formatDuration(minutes) }));
  return `<section class="panel"><h2>${title}</h2>${rows.length ? horizontalBars(rows) : `<p class="empty">${emptyText}</p>`}</section>`;
}

// Plain-language observations drawn from the numbers.
function observations(sessions, summary, week) {
  const notes = [];
  const share = (minutes) => `${Math.round((minutes / summary.total) * 100)}%`;
  notes.push(`Your strongest day is ${DAYS[summary.bestWeekday]}, with ${formatDuration(summary.weekdayAverages[summary.bestWeekday])} on average.`);
  notes.push(`You study most between ${blockLabel(summary.bestBlock).replace("–", " and ")}.`);

  for (const id of COURSE_ORDER) {
    const actual = totalMinutes(sessions.filter((s) => s.courseId === id)) / summary.total;
    const planned = (COURSES[id].hours * 60) / PLANNED_WEEK_MINUTES;
    if (Math.abs(actual - planned) >= 0.1) {
      notes.push(`${COURSES[id].code} gets ${Math.round(actual * 100)}% of your time. The plan gives it ${Math.round(planned * 100)}%, so it is ${actual > planned ? "ahead of" : "behind"} its share.`);
    }
  }

  const byType = minutesBy(sessions, (s) => s.type);
  if (byType.length > 1) notes.push(`Most of your time goes to ${sessionTypeLabel(byType[0][0]).toLowerCase()} (${share(byType[0][1])}), then ${sessionTypeLabel(byType[1][0]).toLowerCase()} (${share(byType[1][1])}).`);

  const weekMinutes = totalMinutes(week);
  const daysLeft = 7 - ((new Date().getDay() + 6) % 7);
  const remaining = PLANNED_WEEK_MINUTES - weekMinutes;
  if (remaining > 0) notes.push(`To reach ${PLANNED_WEEK_MINUTES / 60} hours this week you need ${formatDuration(remaining / daysLeft)} a day for the ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left, today included.`);
  else notes.push(`You have passed this week's ${PLANNED_WEEK_MINUTES / 60}-hour plan by ${formatDuration(-remaining)}.`);

  if (summary.count >= 5) {
    const short = sessions.filter((s) => minutesOf(s) < 25).length;
    if (short / summary.count >= 0.4) notes.push(`${short} of your ${summary.count} sessions were under 25 minutes. Longer blocks suit proofs and problem sets better.`);
  }
  return notes;
}

function emptyState() {
  return `<section class="panel"><h2>No study time recorded yet</h2><p class="lede">Start the timer when you sit down to study and stop it when you finish. After your first session this page shows:</p>`
    + `<ul class="insights"><li>Hours this week against the 16-hour plan, per course.</li><li>A day-by-day and week-by-week picture of your study time.</li><li>Which weekdays and times of day you study most.</li><li>How your time splits between lectures, reading, problem sets and your own tags.</li></ul>`
    + `<div class="actions"><a class="btn primary" href="#timer">Open the timer</a></div></section>`;
}

export function insightsView() {
  const sessions = store.sessions;
  const head = pageHead("Study time", "Insights", "Where your study time goes, how it compares with the plan, and when you are most productive.");
  const summary = summarize(sessions);
  if (!summary) return head + emptyState();
  const week = sessionsThisWeek(sessions);
  return head
    + statsPanel(sessions, summary, week)
    + `<section class="panel"><h2>What stands out</h2><ul class="insights">${observations(sessions, summary, week).map((n) => `<li>${esc(n)}</li>`).join("")}</ul></section>`
    + `<div class="grid2">${planPanel(week)}${weekdayPanel(summary)}</div>`
    + dailyPanel(sessions)
    + `<div class="grid2">${heatPanel(summary)}${weeklyPanel(sessions)}</div>`
    + `<div class="grid2">${breakdownPanel("By activity", minutesBy(sessions, (s) => s.type), sessionTypeLabel, "")}${breakdownPanel("By your tags", minutesBy(sessions, (s) => s.tag), (t) => `#${t}`, "Add a tag when you start a session to compare places, moods or methods.")}</div>`;
}
