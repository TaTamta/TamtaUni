// Chart building blocks, drawn with plain HTML and CSS.
//
// Course colours come from the --v-* tokens in styles.css, which were checked for
// colour-blind separation. Labels stay in text colours; marks carry the colour.
// Every mark has a hover title, and each chart can add a table view underneath.

import { esc } from "./components.js";

/**
 * Horizontal bars with direct labels.
 * rows: [{ label, value, display, courseId?, target? }]; `target` draws a marker on the same scale.
 */
export function horizontalBars(rows, max) {
  const scale = max || Math.max(1, ...rows.map((r) => Math.max(r.value, r.target || 0)));
  const pct = (v) => Math.min(100, (v / scale) * 100);
  return `<div class="hbars">${rows.map((r) =>
    `<span>${r.labelHtml || esc(r.label)}</span>`
    + `<span class="track${r.courseId ? ` c-${r.courseId}` : ""}" title="${esc(`${r.label}: ${r.display}`)}"><span class="fill${r.value ? "" : " zero"}" style="width:${pct(r.value)}%"></span>`
    + (r.target ? `<span class="mark" style="left:calc(${pct(r.target)}% - 1px)"></span>` : "")
    + `</span><span class="val">${esc(r.display)}</span>`).join("")}</div>`;
}

/**
 * Vertical columns, optionally stacked.
 * columns: [{ label, title, segments: [{ value, courseId? }] }]; `plan` draws a dashed reference line.
 */
export function columnChart(columns, { plan = 0, planLabel = "" } = {}) {
  const totals = columns.map((c) => c.segments.reduce((sum, s) => sum + s.value, 0));
  const max = Math.max(1, plan, ...totals) * 1.08;
  const cols = columns.map((c) =>
    `<div class="col" title="${esc(c.title)}">${[...c.segments].reverse().filter((s) => s.value > 0).map((s) =>
      `<span class="seg${s.courseId ? ` c-${s.courseId}` : ""}" style="height:${(s.value / max) * 100}%"></span>`).join("")}</div>`).join("");
  const planLine = plan ? `<div class="plan" style="bottom:${(plan / max) * 100}%"><span>${esc(planLabel)}</span></div>` : "";
  return `<div class="vchart">${cols}${planLine}</div><div class="vlabels">${columns.map((c) => `<span>${esc(c.label)}</span>`).join("")}</div>`;
}

/** Weekday × time-of-day grid; darker means more time. `titleOf(row, col, value)` gives the hover text. */
export function heatmap(grid, rowLabels, colLabels, titleOf) {
  const max = Math.max(...grid.flat());
  const level = (v) => (v <= 0 || !max ? 0 : Math.min(4, Math.ceil((v / max) * 4)));
  const head = `<span></span>${colLabels.map((l) => `<span class="hl">${l}</span>`).join("")}`;
  const rows = grid.map((row, r) =>
    `<span class="dl">${rowLabels[r]}</span>${row.map((v, c) => `<span class="cell${level(v) ? ` h${level(v)}` : ""}" title="${esc(titleOf(r, c, v))}"></span>`).join("")}`).join("");
  return `<div class="heat">${head}${rows}</div>`;
}

export const legend = (items) =>
  `<div class="legend">${items.map((i) => `<span><span class="swatch${i.courseId ? ` c-${i.courseId}` : ""}"></span>${esc(i.label)}</span>`).join("")}</div>`;

/** Collapsed table of the same numbers as a chart. */
export function tableView(headers, rows) {
  return `<details class="tableview"><summary>Show as table</summary><div class="tbl"><table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>`
    + `<tbody>${rows.map((r) => `<tr>${r.map((cell, i) => `<td${i ? ' class="num"' : ""}>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>`;
}
