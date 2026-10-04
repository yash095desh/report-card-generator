import type { ClassKey, Template } from "@/lib/types";
import { schoolExams } from "./school-exams";
import { secondary } from "./secondary";

export const TEMPLATES: Template[] = [schoolExams, secondary];

export const CLASS_ORDER: ClassKey[] = ["N", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export function templateFor(cls: ClassKey): Template {
  const t = TEMPLATES.find((tpl) => tpl.classes.includes(cls));
  if (!t) throw new Error(`No template for class ${cls}`);
  return t;
}

/** "NURSERY", "LKG", "6" — as printed on the sheet. */
export const classLabel = (cls: ClassKey) => (cls === "N" ? "NURSERY" : cls);

/** "Nursery", "LKG", "Class 6" — as shown on screen. */
export const className = (cls: ClassKey) => (cls === "N" ? "Nursery" : isNaN(Number(cls)) ? cls : `Class ${cls}`);

const ordinal = (cls: ClassKey) => {
  const n = Number(cls);
  if (isNaN(n)) return classLabel(cls);
  return n + (n === 1 ? "ST" : n === 2 ? "ND" : n === 3 ? "RD" : "TH");
};

/** The class a passing student is promoted to: Nursery → LKG, 6 → 7TH. Class 10 has none here. */
export function nextClass(cls: ClassKey): string {
  const i = CLASS_ORDER.indexOf(cls);
  if (i < 0) return "";
  if (cls === "10") return "11TH";
  return ordinal(CLASS_ORDER[i + 1]);
}

/** Returns a list of problems; an empty list means the template is valid for every class it covers. */
export function validateTemplate(t: Template): string[] {
  const errors: string[] = [];
  if (!t.classes.length) errors.push(`${t.id}: covers no classes`);
  if (!t.columns.length) errors.push(`${t.id}: has no columns`);
  for (const c of t.columns) {
    if (!(c.max > 0)) errors.push(`${t.id}: column ${c.key} has no maximum marks`);
  }
  if (t.rule === "school") {
    const sum = t.columns.reduce((a, c) => a + (c.weight ?? 0), 0);
    if (sum !== 100) errors.push(`${t.id}: column weights add up to ${sum}, not 100`);
  }
  if (t.rule === "board75") {
    const keys = t.columns.map((c) => c.key).sort().join(",");
    if (keys !== "aw,hy,pw,q") errors.push(`${t.id}: board75 needs columns aw, pw, q, hy`);
  }
  for (const cls of t.classes) {
    const subjects = t.subjects(cls);
    if (!subjects.length) errors.push(`${t.id}: class ${cls} has no subjects`);
    const names = subjects.map((s) => s.name);
    if (new Set(names).size !== names.length) errors.push(`${t.id}: class ${cls} has duplicate subjects`);
  }
  return errors;
}
