import { SchoolConfig, Grade, Division, SubjectConfig } from "@/types";

export const mathSpecialSubject: SubjectConfig = {
  code: "100",
  name: "MATHS (SPECIAL)",
  nameHindi: "गणित (विशेष)",
};

export const schoolConfig: SchoolConfig = {
  schoolName: "PRAGYA PUBLIC SCHOOL",
  schoolAddress: "CS Azad Nagar",
  district: "ALIRAJPUR (M.P.)",
  board: "MPBSE",
  email: "schoolpragyapublic222@gmail.com",
  diseCode: "23490705330",
  schoolCode: "582023",
  academicYear: "2025-26",
  className: "CLASS - 9",
  section: "",
  logo: "/Group 1000011812.png",
  subjects: [
    { code: "101", name: "MATHS (BASIC)", nameHindi: "गणित (बेसिक)" },
    { code: "200", name: "SCIENCE", nameHindi: "विज्ञान" },
    { code: "300", name: "SOCIAL SCIENCE", nameHindi: "सामाजिक विज्ञान" },
    { code: "401", name: "HINDI", nameHindi: "हिन्दी" },
    { code: "411", name: "ENGLISH", nameHindi: "अंग्रेज़ी" },
    { code: "512", name: "SANSKRIT", nameHindi: "संस्कृत" },
  ],
  minMarksTH: 25,
  minMarksPR: 8,
  maxMarksTH: 75,
  maxMarksPR: 25,
};

// Grade scale (MP Board) — matches spec exactly
export const gradeScale: { grade: Grade; minPercent: number; maxPercent: number }[] = [
  { grade: "A+", minPercent: 85, maxPercent: 100 },
  { grade: "A", minPercent: 76, maxPercent: 84.9 },
  { grade: "B+", minPercent: 66, maxPercent: 75.9 },
  { grade: "B", minPercent: 56, maxPercent: 65.9 },
  { grade: "C+", minPercent: 51, maxPercent: 55.9 },
  { grade: "C", minPercent: 46, maxPercent: 50.9 },
  { grade: "D", minPercent: 33, maxPercent: 45.9 },
  { grade: "E1", minPercent: 0, maxPercent: 32.9 },
];

// Division scale
export const divisionScale: { division: Division; minPercent: number }[] = [
  { division: "FIRST DIVISION", minPercent: 60 },
  { division: "SECOND DIVISION", minPercent: 45 },
  { division: "THIRD DIVISION", minPercent: 33 },
  { division: "FAIL", minPercent: 0 },
];
