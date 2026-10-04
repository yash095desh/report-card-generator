import type { ClassKey, Marks, Overrides, Subject } from "@/lib/types";
import { templateFor } from "@/lib/templates";
import { calcResult, visibleColumns } from "@/lib/rules/marks";

export const noOverrides = (): Overrides => ({ result: "", grade: "", division: "", words: "", remarks: {} });

export function subjectsFor(cls: ClassKey): Subject[] {
  return templateFor(cls).subjects(cls).map((s, i) => ({ ...s, id: `s${i}` }));
}

/** Builds marks from rows of numbers (or "AB"/""), one row per subject, in column order. */
export function marksFrom(cls: ClassKey, rows: (number | string)[][], subjects = subjectsFor(cls)): Marks {
  const cols = templateFor(cls).columns;
  const marks: Marks = {};
  subjects.forEach((s, i) => {
    marks[s.id] = {};
    cols.forEach((c, j) => {
      const v = rows[i]?.[j];
      marks[s.id][c.key] = v === undefined ? "" : String(v);
    });
  });
  return marks;
}

export function resultFor(
  cls: ClassKey,
  rows: (number | string)[][],
  opts: { maxOv?: Record<string, number>; colOv?: Record<string, { label?: string; hidden?: boolean }>; overrides?: Overrides } = {},
) {
  const t = templateFor(cls);
  const subjects = subjectsFor(cls);
  const columns = visibleColumns(t, opts.maxOv ?? {}, opts.colOv ?? {});
  return calcResult(t, subjects, columns, marksFrom(cls, rows, subjects), opts.overrides ?? noOverrides());
}
