import { SubjectMarks, CalculatedResult, Grade, Division, Student } from "@/types";
import { schoolConfig, gradeScale, divisionScale } from "@/config/schoolConfig";
import numberToWords from "number-to-words";

function toNum(val: number | ""): number {
  return val === "" ? 0 : val;
}

export function getGrade(percentage: number): Grade {
  for (const entry of gradeScale) {
    if (percentage >= entry.minPercent) {
      return entry.grade;
    }
  }
  return "E";
}

export function getDivision(percentage: number): Division {
  for (const entry of divisionScale) {
    if (percentage >= entry.minPercent) {
      return entry.division;
    }
  }
  return "FAIL";
}

export function getResult(percentage: number): "PASS" | "FAIL" {
  return percentage >= 33 ? "PASS" : "FAIL";
}

export function totalToWords(total: number): string {
  if (total <= 0) return "";
  const rounded = Math.round(total);
  return numberToWords.toWords(rounded).toUpperCase().replace(/-/g, " ").replace(/,/g, "");
}

// Per-subject calculation (official MP Board format)
// TH = Annual Written (direct, out of 75)
// PR = (projectWork/25 × 22.5) + (monthlyTest/75 × 1.25) + (halfYearly/25 × 1.25) = out of 25
// Grand Total = TH + PR = out of 100
export function calculateSubjectRow(marks: SubjectMarks) {
  const mt = toNum(marks.monthlyTest);
  const hy = toNum(marks.halfYearly);
  const aw = toNum(marks.annualWritten);
  const pw = toNum(marks.projectWork);

  // Theory = Annual Written direct (out of 75)
  const theory = aw;

  // Practical components (all contribute to PR out of 25):
  // 90% from project work: (pw/25) × 22.5
  const prProject = (pw / 25) * 22.5;
  // 5% from quarterly (monthly test): (mt/75) × 1.25
  const prQuarterly = (mt / 75) * 1.25;
  // 5% from half yearly: (hy/75) × 1.25
  const prHalfYearly = (hy / 75) * 1.25;

  const practical = prProject + prQuarterly + prHalfYearly;
  const grandTotal = theory + practical;

  const theoryRound = Math.round(theory);
  const practicalRound = Math.round(practical);

  return {
    annualTheory: aw,
    annualProject: Math.round(prProject * 100) / 100,
    quarterlyWeightage: Math.round(prQuarterly * 100) / 100,
    halfYearlyWeightage: Math.round(prHalfYearly * 100) / 100,
    theoryRound,
    practicalRound,
    grandTotal: theoryRound + practicalRound,
  };
}

export function calculateStudentResult(student: Student): CalculatedResult {
  const subjects = schoolConfig.subjects;
  let totalMarks = 0;

  for (const subject of subjects) {
    const marks = student.marks[subject.code];
    if (!marks) continue;
    const row = calculateSubjectRow(marks);
    totalMarks += row.grandTotal;
  }

  const maxMarks = 600;
  const percentage = (totalMarks / maxMarks) * 100;

  return {
    column1: 0, // not used in new system
    column2: 0,
    column3: 0,
    column4: 0,
    totalMarks: Math.round(totalMarks * 100) / 100,
    maxMarks,
    percentage: Math.round(percentage * 100) / 100,
    grade: student.overrides.grade ?? getGrade(percentage),
    division: student.overrides.division ?? getDivision(percentage),
    result: student.overrides.result ?? getResult(percentage),
    totalInWords: student.overrides.totalInWords ?? totalToWords(totalMarks),
  };
}
