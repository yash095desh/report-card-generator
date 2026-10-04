export type ClassKey = "N" | "LKG" | "UKG" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";

export type Medium = "English" | "Hindi";

export type Grade = "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "E";

export type Division = "FIRST DIVISION" | "SECOND DIVISION" | "THIRD DIVISION" | "FAIL";

/** How a template turns column marks into a subject total. */
export type RuleId = "school" | "board75";

export interface Column {
  key: string;
  label: string;
  hi: string;
  /** Maximum marks for this column. */
  max: number;
  /** Share of the subject's 100 this column counts for ("school" rule only). */
  weight?: number;
}

/** A subject as written in a template or a saved setup (no runtime id). */
export interface SubjectSeed {
  code: string;
  name: string;
  hi: string;
  /** The Class 9–10 Maths subject that switches between Standard (100) and Basic (101). */
  maths?: boolean;
}

export interface Subject extends SubjectSeed {
  id: string;
}

export interface GradeRow {
  en: string;
  hi: string;
  /** Shown as a single large grade box on the sheet (Class 9–10 EE&DM). */
  big?: boolean;
}

export interface Template {
  id: "school" | "secondary";
  label: string;
  range: string;
  classes: ClassKey[];
  rule: RuleId;
  columns: Column[];
  /** Teachers may rename/hide columns and change maximum marks (Nursery–8 only). */
  maxEditable: boolean;
  distn: boolean;
  division: boolean;
  showEnrolment: boolean;
  /** Category (General/OBC/SC/ST) is asked for and printed. */
  showCategory: boolean;
  examMonth: string;
  pctDigits: 1 | 2;
  promote: boolean;
  examIncharge: boolean;
  coScholastic: boolean;
  dobWords: boolean;
  mathsSwitch: boolean;
  words: { pass: string; fail: string };
  subjects: (cls: ClassKey) => SubjectSeed[];
  gradeRows: (cls: ClassKey) => GradeRow[];
}

export interface ColumnOverride {
  label?: string;
  hidden?: boolean;
}

/** A class's saved subject setup. Never contains student data. */
export interface Format {
  subjects: SubjectSeed[];
  maxOv: Record<string, number>;
  colOv: Record<string, ColumnOverride>;
}

/** Raw text typed into each marks box: subject id → column key → text ("", "AB" or a number). */
export type Marks = Record<string, Record<string, string>>;

export interface Overrides {
  result: string;
  grade: string;
  division: string;
  words: string;
  remarks: Record<string, string>;
}

export interface Student {
  fullName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  category: string;
  roll: string;
  enrolment: string;
  scholar: string;
  samagra: string;
  medium: Medium;
  photo: string;
  attPresent: string;
  attTotal: string;
}

export interface Session {
  year: string;
  month: string;
  examYear: string;
  teacher: string;
  incharge: string;
  principal: string;
  publish: string;
}
