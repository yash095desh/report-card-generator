export type Medium = "Hindi" | "English";

export type Category =
  | "General"
  | "OBC"
  | "OBC-A"
  | "OBC-B"
  | "SC"
  | "ST";

export type Grade = "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "E" | "E1" | "E2";

export type Division = "FIRST DIVISION" | "SECOND DIVISION" | "THIRD DIVISION" | "FAIL";

export type Result = "PASS" | "FAIL";

export interface SubjectConfig {
  code: string;
  name: string;
  nameHindi: string;
}

export interface SubjectMarks {
  monthlyTest: number | "";      // out of 75
  halfYearly: number | "";       // out of 25
  annualWritten: number | "";    // out of 75
  projectWork: number | "";      // out of 25
}

export interface SubjectResult {
  subjectCode: string;
  obtained: SubjectMarks;
  monthlyTestWeightage: number;
  halfYearlyWeightage: number;
  annualWrittenRaw: number;
  projectWorkWeightage: number;
  theoryTotal: number;
  practicalTotal: number;
  grandTotal: number;
  remarks: string;
}

export interface CalculatedResult {
  column1: number;  // Monthly Test: sum of weightages / 4
  column2: number;  // Half Yearly: sum of weightages / 4
  column3: number;  // Annual Written: sum of raw marks
  column4: number;  // Project Work: sum of weightages / 4
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  grade: Grade;
  division: Division;
  result: Result;
  totalInWords: string;
}

export interface Student {
  id: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  category: Category;
  rollNumber: string;
  scholarNumber: string;
  enrolmentNumber: string;
  samagraId: string;
  aadhaarNumber: string;
  medium: Medium;
  photo: string;                  // base64 or empty
  attendancePresent: number | "";
  attendanceTotal: number | "";
  remarks: string;
  publishDate: string;

  // Marks per subject (keyed by subject code)
  marks: Record<string, SubjectMarks>;

  // Auto-calculated but editable overrides
  overrides: {
    grade?: Grade;
    division?: Division;
    result?: Result;
    totalInWords?: string;
    subjectRemarks?: Record<string, string>;
    envEducationGrade?: string;
  };

  // Staff names (per student so teacher can vary if needed)
  classTeacherName: string;
  examInchargeName: string;
  principalName: string;
}

export interface SchoolConfig {
  schoolName: string;
  schoolAddress: string;
  district: string;
  board: string;
  diseCode: string;
  schoolCode: string;
  academicYear: string;
  className: string;
  section: string;
  logo: string;  // base64 or path
  subjects: SubjectConfig[];
  minMarksTH: number;
  minMarksPR: number;
  maxMarksTH: number;
  maxMarksPR: number;
}
