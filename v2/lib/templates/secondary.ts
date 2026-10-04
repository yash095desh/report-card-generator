import type { SubjectSeed, Template } from "@/lib/types";

export const MATHS_STANDARD: SubjectSeed = { code: "100", name: "MATHS (STANDARD)", hi: "गणित (स्टैंडर्ड)", maths: true };
export const MATHS_BASIC: SubjectSeed = { code: "101", name: "MATHS (BASIC)", hi: "गणित (बेसिक)", maths: true };

/**
 * Classes 9–10, MP Board pattern (the v1 rule, confirmed by the school's Class 9 sheet):
 * TH = annual written /75; PR = project /25 → 22.5 + quarterly /75 → 1.25 + half-yearly /75 → 1.25.
 */
export const secondary: Template = {
  id: "secondary",
  label: "Secondary",
  range: "9–10",
  classes: ["9", "10"],
  rule: "board75",
  columns: [
    { key: "aw", label: "Annual theory", hi: "वार्षिक सैद्धांतिक", max: 75 },
    { key: "pw", label: "Project", hi: "प्रोजेक्ट", max: 25 },
    { key: "q", label: "Quarterly", hi: "त्रैमासिक", max: 75 },
    { key: "hy", label: "Half-yearly", hi: "अर्धवार्षिक", max: 75 },
  ],
  maxEditable: false,
  distn: true,
  division: true,
  showEnrolment: true,
  showCategory: false,
  examMonth: "FEBRUARY",
  pctDigits: 1,
  promote: false,
  examIncharge: false,
  coScholastic: false,
  dobWords: false,
  mathsSwitch: true,
  words: { pass: "PASS", fail: "FAIL" },
  subjects: () => [
    { code: "401", name: "HINDI", hi: "हिन्दी" },
    { code: "411", name: "ENGLISH", hi: "अंग्रेज़ी" },
    { code: "512", name: "SANSKRIT", hi: "संस्कृत" },
    MATHS_STANDARD,
    { code: "200", name: "SCIENCE", hi: "विज्ञान" },
    { code: "300", name: "SOCIAL SCIENCE", hi: "सामाजिक विज्ञान" },
  ],
  gradeRows: () => [{ en: "ENVIRONMENTAL EDUCATION & DISASTER MANAGEMENT GRADE", hi: "पर्यावरण शिक्षा एवं आपदा प्रबंधन", big: true }],
};

/** Board minimum marks for Class 9–10 subjects. */
export const BOARD75 = { maxTH: 75, maxPR: 25, minTH: 25, minPR: 8 } as const;
