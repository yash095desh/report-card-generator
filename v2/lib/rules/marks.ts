import type { Column, ColumnOverride, Division, Grade, Marks, Overrides, Subject, Template } from "@/lib/types";
import { BOARD75 } from "@/lib/templates/secondary";
import { getDivision, getGrade } from "./grades";
import { totalToWords } from "./words";

export interface MarkValue {
  n: number;
  blank?: boolean;
  ab?: boolean;
}

/** Reads one marks box: "AB" = absent (counts 0), "" = blank (counts 0), otherwise a number. */
export function readMark(raw: string | undefined): MarkValue {
  if (raw === "AB") return { ab: true, n: 0 };
  if (raw == null || raw === "" || raw === ".") return { blank: true, n: 0 };
  const n = parseFloat(raw);
  return isNaN(n) ? { blank: true, n: 0 } : { n };
}

/** Keeps only what a marks box may hold while typing: digits with up to 2 decimals, or "A"/"AB". */
export function sanitizeMark(value: string): string {
  let v = value.toUpperCase().replace(/\s/g, "");
  if (v.startsWith("A") && /^A?B?$/.test(v)) return v === "AB" ? "AB" : "A";
  v = v.replace(/[^0-9.]/g, "");
  const dot = v.indexOf(".");
  if (dot >= 0) v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, "").slice(0, 2);
  return v.slice(0, 6);
}

/** Every column of the template with the teacher's renames, hidden flags and maximum marks applied. */
export function allColumns(
  t: Template,
  maxOv: Record<string, number>,
  colOv: Record<string, ColumnOverride>,
): (Column & { hidden: boolean })[] {
  return t.columns.map((c) => {
    const o = (t.maxEditable && colOv[c.key]) || {};
    return {
      ...c,
      label: o.label || c.label,
      hi: o.label || c.hi,
      hidden: !!o.hidden,
      max: (t.maxEditable && maxOv[c.key]) || c.max,
    };
  });
}

/** The columns that are shown and counted. */
export const visibleColumns = (t: Template, maxOv: Record<string, number>, colOv: Record<string, ColumnOverride>): Column[] =>
  allColumns(t, maxOv, colOv).filter((c) => !c.hidden);

export interface SubjectRow {
  subject: Subject;
  columns: Column[];
  values: Record<string, MarkValue>;
  /** Columns whose mark is above the column maximum. */
  invalid: Column[];
  blanks: number;
  entered: number;
  /** null while any mark is above its maximum. */
  total: number | null;
  pass: boolean;
  /** Printed values per column ("school": weighted parts; "board75": the sheet's I/II/III cells). */
  cells: Record<string, string | number>;
  thR?: number;
  prR?: number;
  remark: string;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function calcSubject(
  t: Template,
  subject: Subject,
  columns: Column[],
  marks: Record<string, string> | undefined,
  remarkOverride?: string,
): SubjectRow {
  const m = marks ?? {};
  const values: Record<string, MarkValue> = {};
  const invalid: Column[] = [];
  let blanks = 0;
  let entered = 0;
  for (const c of columns) {
    const v = readMark(m[c.key]);
    values[c.key] = v;
    if (v.blank) blanks++;
    else entered++;
    if (!v.ab && !v.blank && v.n > c.max) invalid.push(c);
  }
  const row: SubjectRow = { subject, columns, values, invalid, blanks, entered, total: null, pass: false, cells: {}, remark: "" };
  if (invalid.length) return row;

  if (t.rule === "board75") {
    const v = (k: string) => values[k] ?? { n: 0, blank: true };
    const prP = (v("pw").n / 25) * 22.5;
    const prQ = (v("q").n / 75) * 1.25;
    const prH = (v("hy").n / 75) * 1.25;
    row.thR = Math.round(v("aw").n);
    row.prR = Math.round(prP + prQ + prH);
    row.total = row.thR + row.prR;
    row.pass = row.thR >= BOARD75.minTH && row.prR >= BOARD75.minPR;
    const show = (k: string, text: string) => (v(k).ab ? "AB" : v(k).blank ? "" : text);
    row.cells = {
      aw: show("aw", String(r2(v("aw").n))),
      pw: show("pw", String(r2(prP))),
      q: show("q", r2(prQ).toFixed(2)),
      hy: show("hy", r2(prH).toFixed(2)),
    };
  } else {
    // "school": each column contributes round(obtained / max × weight); hidden columns simply aren't here.
    let sum = 0;
    for (const c of columns) {
      const w = Math.round((values[c.key].n / c.max) * (c.weight ?? 0));
      row.cells[c.key] = w;
      sum += w;
    }
    row.total = sum;
    row.pass = sum >= 33;
  }

  const auto = t.distn && row.total >= 75 ? "DISTN" : "";
  row.remark = remarkOverride ? remarkOverride : auto;
  return row;
}

export interface Result {
  rows: SubjectRow[];
  anyInvalid: boolean;
  anyEntered: boolean;
  total: number;
  max: number;
  pct: number;
  grade: Grade;
  result: string;
  passed: boolean;
  division: Division | null;
  words: string;
}

export function calcResult(
  t: Template,
  subjects: Subject[],
  columns: Column[],
  marks: Marks,
  overrides: Overrides,
): Result {
  const rows = subjects.map((s) => calcSubject(t, s, columns, marks[s.id], overrides.remarks[s.id]));
  const anyInvalid = rows.some((r) => r.invalid.length > 0);
  const anyEntered = rows.some((r) => r.entered > 0);
  const total = rows.reduce((a, r) => a + (r.total ?? 0), 0);
  const max = rows.length * 100;
  const pct = max ? (total / max) * 100 : 0;
  const allPass = rows.length > 0 && rows.every((r) => r.pass);
  const passed = overrides.result ? overrides.result === t.words.pass : allPass;
  return {
    rows,
    anyInvalid,
    anyEntered,
    total,
    max,
    pct,
    grade: (overrides.grade as Grade) || getGrade(pct),
    result: overrides.result || (allPass ? t.words.pass : t.words.fail),
    passed,
    division: t.division ? ((overrides.division as Division) || (passed ? getDivision(pct) : "FAIL")) : null,
    words: overrides.words || totalToWords(total),
  };
}

/** Percentage as printed: 1 decimal for 9–10 (97.3), 2 decimals for Nursery–8 (95.67). */
export const formatPct = (t: Template, pct: number) => pct.toFixed(t.pctDigits);
