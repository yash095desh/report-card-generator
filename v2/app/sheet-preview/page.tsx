import { notFound } from "next/navigation";
import { Marksheet } from "@/components/sheet/Marksheet";
import { CLASS_ORDER, templateFor } from "@/lib/templates";
import { calcResult, visibleColumns } from "@/lib/rules/marks";
import { CO_SCHOLASTIC, SOCIAL_QUALITIES } from "@/lib/templates/school-exams";
import type { ClassKey, Marks, Overrides, Session, Student } from "@/lib/types";

/**
 * Development-only page that renders the printed sheet with the reference marks from the
 * school's real sheets, for print checks: /sheet-preview?cls=9&medium=Hindi
 */
const FIXTURES: Partial<Record<ClassKey, (number | string)[][]>> = {
  N: [[28, 51, 53, 35], [28, 42, 50, 34], [28, 48, 48, 35]],
  "1": [[36, 50, 40, 40], [32, 51, 42, 36], [32, 43, 38, 32], [35, 55, 55, 36], [34, 50, 42, 34]],
  "6": [[39, 60, 59, 40], [40, 58, 59, 36], [38, 60, 56, 40], [38, 59, 46, 40], [37, 54, 60, 40], [38, 58, 60, 38]],
  "9": [[74, 25, 74, 74], [73, 25, 74, 74], [74, 25, 73, 74], [70, 25, 72, 74], [71, 24, 73, 73], [73, 25, 72, 74]],
};

export default async function SheetPreview({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const params = await searchParams;
  const cls = (CLASS_ORDER.includes(params.cls as ClassKey) ? params.cls : "9") as ClassKey;
  const t = templateFor(cls);
  const subjects = t.subjects(cls).map((s, i) => ({ ...s, id: `s${i}` }));
  // ?extra=N adds N dummy subjects to test the fit-to-one-page behaviour.
  for (let i = 0; i < Number(params.extra ?? 0); i++) subjects.push({ code: "", name: `EXTRA ${i + 1}`, hi: `अतिरिक्त ${i + 1}`, id: `x${i}` });
  const columns = visibleColumns(t, {}, {});
  const rows = FIXTURES[cls] ?? [];
  const marks: Marks = {};
  subjects.forEach((s, i) => {
    marks[s.id] = Object.fromEntries(t.columns.map((c, j) => [c.key, rows[i]?.[j] !== undefined ? String(rows[i][j]) : ""]));
  });
  const overrides: Overrides = { result: "", grade: "", division: "", words: "", remarks: {} };
  const result = calcResult(t, subjects, columns, marks, overrides);
  const student: Student = {
    fullName: "TEST STUDENT", fatherName: "FATHER NAME", motherName: "MOTHER NAME", dob: "2013-10-19", category: "General",
    roll: "1234", enrolment: t.showEnrolment ? "A00/000000/000" : "", scholar: "0000", samagra: "000000000",
    medium: params.medium === "Hindi" ? "Hindi" : "English", photo: "", attPresent: "175", attTotal: "215",
  };
  const session: Session = {
    year: "2025-26", month: t.examMonth, examYear: "2026", teacher: "CLASS TEACHER", incharge: "EXAM INCHARGE",
    principal: "ANITA DESHMUKH", publish: "2026-04-05",
  };
  const gradeRows = Object.fromEntries(t.gradeRows(cls).map((g) => [g.en, "A+"]));
  const co = Object.fromEntries([...CO_SCHOLASTIC, ...SOCIAL_QUALITIES].map((g) => [g.en, "A+"]));

  return (
    <div style={{ padding: 24, display: "flex", justifyContent: "center" }} className="preview-wrap">
      <div className="paper" id="paper">
        <Marksheet cls={cls} student={student} session={session} result={result} columns={columns} marks={marks} gradeRows={gradeRows} co={co} />
      </div>
    </div>
  );
}
