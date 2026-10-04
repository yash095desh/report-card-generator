import type { ClassKey, GradeRow, SubjectSeed, Template } from "@/lib/types";

const sub = (name: string, hi: string): SubjectSeed => ({ code: "", name, hi });

const isPrePrimary = (cls: ClassKey) => cls === "N" || cls === "LKG" || cls === "UKG";

/** Evaluation of co-scholastic area (9 items), as on the school's current Nursery–8 sheets. */
export const CO_SCHOLASTIC: GradeRow[] = [
  { en: "REGULARITY", hi: "नियमितता" },
  { en: "PUNCTUALITY", hi: "समय पालन" },
  { en: "CLEANLINESS", hi: "स्वच्छता" },
  { en: "DISCIPLINE", hi: "अनुशासन" },
  { en: "HELPFULNESS / ATTITUDE", hi: "सहयोग / व्यवहार" },
  { en: "SENSITIVITY TOWARDS NATURE", hi: "प्रकृति के प्रति संवेदनशीलता" },
  { en: "ABILITY OF LEADERSHIP", hi: "नेतृत्व क्षमता" },
  { en: "TRUTHFULNESS", hi: "सत्यनिष्ठा" },
  { en: "HONESTY", hi: "ईमानदारी" },
];

/** Individual evaluation of social qualities (6 items). */
export const SOCIAL_QUALITIES: GradeRow[] = [
  { en: "LITERATURE", hi: "साहित्यिक" },
  { en: "CULTURAL", hi: "सांस्कृतिक" },
  { en: "SCIENTIFIC", hi: "वैज्ञानिक" },
  { en: "CREATIVITY", hi: "सृजनात्मकता" },
  { en: "SPORTS / YOGA", hi: "खेलकूद / योग" },
  { en: "OJAS CLUB / EK BHARAT SHRESHTH BHARAT", hi: "ओजस क्लब / एक भारत श्रेष्ठ भारत" },
];

/**
 * Nursery, LKG, UKG and Classes 1–8. Rule and layout come from the school's own
 * Nursery, Class 1 and Class 6 sheets: Monthly /40 → 10, Half-yearly /60 → 20,
 * Written /60 → 60, Project /40 → 10, each part rounded, then added.
 */
export const schoolExams: Template = {
  id: "school",
  label: "Nursery – Class 8",
  range: "Nursery–8",
  classes: ["N", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8"],
  rule: "school",
  columns: [
    { key: "mo", label: "Monthly", hi: "मासिक", max: 40, weight: 10 },
    { key: "hy", label: "Half-yearly", hi: "अर्धवार्षिक", max: 60, weight: 20 },
    { key: "wr", label: "Written", hi: "लिखित", max: 60, weight: 60 },
    { key: "pj", label: "Project", hi: "प्रोजेक्ट", max: 40, weight: 10 },
  ],
  maxEditable: true,
  distn: false,
  division: false,
  showEnrolment: false,
  showCategory: true,
  examMonth: "MARCH",
  pctDigits: 2,
  promote: true,
  examIncharge: true,
  coScholastic: true,
  dobWords: true,
  mathsSwitch: false,
  words: { pass: "PASS", fail: "FAIL" },
  subjects: (cls) => {
    const core = [sub("ENGLISH", "अंग्रेज़ी"), sub("HINDI", "हिन्दी")];
    if (isPrePrimary(cls)) return [...core, sub("MATHEMATICS", "गणित")];
    if (Number(cls) <= 5) {
      return [...core, sub("MATHEMATICS", "गणित"), sub("EVS", "पर्यावरण अध्ययन"), sub("GENERAL KNOWLEDGE", "सामान्य ज्ञान")];
    }
    return [
      ...core,
      sub("SANSKRIT", "संस्कृत"),
      sub("MATHEMATICS", "गणित"),
      sub("SCIENCE", "विज्ञान"),
      sub("SOCIAL SCIENCE", "सामाजिक विज्ञान"),
    ];
  },
  gradeRows: (cls) => (isPrePrimary(cls) || Number(cls) <= 5 ? [{ en: "DRAWING / PAINTING", hi: "चित्रकला" }] : []),
};
