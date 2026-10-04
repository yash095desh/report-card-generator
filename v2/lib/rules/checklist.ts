import type { ClassKey, Session, Student, Template } from "@/lib/types";
import { CO_SCHOLASTIC, SOCIAL_QUALITIES } from "@/lib/templates/school-exams";
import { titleCase } from "@/lib/text";
import type { Result } from "./marks";

export interface Issue {
  level: "err" | "warn";
  message: string;
}


/** The "Before you print" list. Any "err" blocks printing; "warn" lets the teacher print anyway. */
export function buildChecklist(args: {
  template: Template;
  cls: ClassKey;
  student: Student;
  session: Session;
  result: Result;
  gradeRows: Record<string, string>;
  co: Record<string, string>;
}): Issue[] {
  const { template: t, cls, student, session, result, gradeRows, co } = args;
  const issues: Issue[] = [];
  for (const r of result.rows) {
    for (const c of r.invalid) {
      issues.push({ level: "err", message: `${titleCase(r.subject.name)}: ${c.label} is above the maximum of ${c.max}.` });
    }
  }
  if (!student.fullName.trim()) issues.push({ level: "warn", message: "Student's name is empty." });
  if (!student.roll.trim()) issues.push({ level: "warn", message: "Roll number is empty." });
  const blanks = result.rows.reduce((a, r) => a + r.blanks, 0);
  if (blanks) issues.push({ level: "warn", message: `${blanks} marks ${blanks === 1 ? "box is" : "boxes are"} blank and will count as 0.` });
  const missingGrades = t.gradeRows(cls).filter((g) => !gradeRows[g.en]);
  if (missingGrades.length) {
    issues.push({ level: "warn", message: `No grade chosen for ${missingGrades.map((g) => titleCase(g.en.replace(" GRADE", ""))).join(", ")}.` });
  }
  if (t.coScholastic) {
    const n = [...CO_SCHOLASTIC, ...SOCIAL_QUALITIES].filter((g) => !co[g.en]).length;
    if (n) issues.push({ level: "warn", message: `${n} co-scholastic ${n === 1 ? "grade is" : "grades are"} not chosen.` });
  }
  if (!session.teacher.trim()) issues.push({ level: "warn", message: "Class teacher's name is empty." });
  return issues;
}

