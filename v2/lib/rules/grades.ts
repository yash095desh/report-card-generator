import type { Division, Grade } from "@/lib/types";

export const GRADES: Grade[] = ["A+", "A", "B+", "B", "C+", "C", "D", "E"];

/** MP Board grade scale, as printed on the school's sheets (below 33% is "E", not v1's "E1"). */
export const GRADE_SCALE: { grade: Grade; range: string; min: number }[] = [
  { grade: "A+", range: "85% to 100%", min: 85 },
  { grade: "A", range: "76% to 84.9%", min: 76 },
  { grade: "B+", range: "66% to 75.9%", min: 66 },
  { grade: "B", range: "56% to 65.9%", min: 56 },
  { grade: "C+", range: "51% to 55.9%", min: 51 },
  { grade: "C", range: "46% to 50.9%", min: 46 },
  { grade: "D", range: "33% to 45.9%", min: 33 },
  { grade: "E", range: "Below 33%", min: 0 },
];

export function getGrade(pct: number): Grade {
  return (GRADE_SCALE.find((g) => pct >= g.min) ?? GRADE_SCALE[GRADE_SCALE.length - 1]).grade;
}

export function getDivision(pct: number): Division {
  if (pct >= 60) return "FIRST DIVISION";
  if (pct >= 45) return "SECOND DIVISION";
  if (pct >= 33) return "THIRD DIVISION";
  return "FAIL";
}
