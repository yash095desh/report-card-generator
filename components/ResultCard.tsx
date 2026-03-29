"use client";

import { Student } from "@/types";
import { schoolConfig } from "@/config/schoolConfig";
import {
  calculateStudentResult,
  calculateSubjectRow,
} from "@/lib/calculations";

interface ResultCardProps {
  student: Student;
}

// Color palette
const navy = "#1a2a5e";
const cream = "#fdf8ef";
const headerBg = "#f0efe8";
const rowAlt = "#fafaf6";
const borderColor = "#444";
const borderLight = "#888";

function L({ en, hi, medium }: { en: string; hi?: string; medium: string }) {
  if (medium === "Hindi" && hi) {
    return (<span>{hi}<br />{en}</span>);
  }
  return <span>{en}</span>;
}

export function ResultCard({ student }: ResultCardProps) {
  const result = calculateStudentResult(student);
  const medium = student.medium;
  const isHindi = medium === "Hindi";

  const subjectRows = schoolConfig.subjects.map((subject) => {
    const marks = student.marks[subject.code] || {
      monthlyTest: "", halfYearly: "", annualWritten: "", projectWork: "",
    };
    const calc = calculateSubjectRow(marks);
    const subjectRemarkOverride = student.overrides.subjectRemarks?.[subject.code];
    const isDistn = calc.grandTotal >= 75;
    return { subject, marks, calc, remarks: subjectRemarkOverride ?? (isDistn ? "DISTN" : "") };
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const totalTH = subjectRows.reduce((sum, r) => sum + r.calc.theoryRound, 0);
  const totalPR = subjectRows.reduce((sum, r) => sum + r.calc.practicalRound, 0);

  // Cell styles
  const b = `border border-[${borderColor}]`;
  const tc = `${b} px-1.5 py-[4px] text-center`;
  const tb = `${tc} font-bold`;
  const th = `${tc} font-bold`;

  return (
    <div
      className="relative w-full text-[10px] leading-[1.35] text-[#111]"
      style={{ fontFamily: "'Noto Sans Devanagari', 'Arial', sans-serif" }}
    >
      <div className="relative">
        {/* ===== OUTER DOUBLE BORDER ===== */}
        <div className="border-[3px] border-[#1a1a1a] p-[2px]">
          <div className="relative border-[1.5px] border-[#1a1a1a] p-[6px]">

            {/* WATERMARK — sits above everything, pointer-events-none so it doesn't block interaction */}
            {schoolConfig.logo && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[50]">
                <img src={schoolConfig.logo} alt="" className="w-[300px] h-[300px] object-contain opacity-[0.08]" />
              </div>
            )}

            {/* ======== BOX A: Header + Meta + IDs + Info ======== */}
            <div className="relative z-[10] border-[1.5px] border-[${borderColor}] mb-[5px]">

              {/* A1: School Header */}
              <div
                className="flex items-center px-4 py-3"
                style={{ borderBottom: `2px solid ${borderColor}`, background: cream }}
              >
                <div className="w-[80px] h-[80px] shrink-0">
                  {schoolConfig.logo ? (
                    <img src={schoolConfig.logo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full rounded-full border-2 border-[#333] flex items-center justify-center">
                      <span className="text-[8px] text-gray-400">LOGO</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center">
                  <h1
                    className="text-[22px] font-extrabold tracking-[0.06em] leading-tight"
                    style={{ color: navy }}
                  >
                    {schoolConfig.schoolName}
                  </h1>
                  <p className="text-[10px] font-semibold text-[#444] mt-0.5">
                    {schoolConfig.schoolAddress}
                  </p>
                  <p className="text-[11px] font-bold mt-0.5" style={{ color: navy }}>
                    DISTRICT - {schoolConfig.district}
                  </p>
                  {/* Decorative divider */}
                  <div className="flex items-center justify-center gap-2 my-1.5">
                    <div className="h-[1px] w-16" style={{ background: navy }} />
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: navy }} />
                    <div className="h-[1px] w-16" style={{ background: navy }} />
                  </div>
                  {isHindi && (
                    <p className="text-[15px] font-extrabold leading-tight" style={{ color: navy }}>
                      अंकसूची
                    </p>
                  )}
                  <p className="text-[15px] font-extrabold leading-tight tracking-[0.15em]" style={{ color: navy }}>
                    MARKSHEET
                  </p>
                </div>
                <div className="w-[80px] h-[80px] shrink-0">
                  {schoolConfig.logo && <img src={schoolConfig.logo} alt="Logo" className="w-full h-full object-contain" />}
                </div>
              </div>

              {/* A2: Meta Row */}
              <div
                className="flex text-[10px] font-bold"
                style={{ borderBottom: `1.5px solid ${borderColor}`, background: headerBg }}
              >
                <div className="flex-1 text-center py-2 border-r" style={{ borderColor: borderLight }}>
                  FEBRUARY - ({schoolConfig.academicYear.split("-")[0]?.slice(0, 4) || "2026"})
                </div>
                <div className="flex-1 text-center py-2 border-r" style={{ borderColor: borderLight }}>
                  {schoolConfig.className}
                </div>
                <div className="flex-1 text-center py-2 border-r" style={{ borderColor: borderLight }}>
                  SESSION - {schoolConfig.academicYear}
                </div>
                <div className="flex-1 text-center py-2">
                  DISE CODE - {schoolConfig.diseCode}
                </div>
              </div>

              {/* A3: Student ID Table */}
              <table className="w-full border-collapse text-[9px]" style={{ borderBottom: `1.5px solid ${borderColor}` }}>
                <thead>
                  <tr style={{ background: headerBg }}>
                    {[
                      { en: "ROLL NO.", hi: "अनुक्रमांक" },
                      { en: "ENROLMENT NO.", hi: "नामांकन क्रमांक" },
                      { en: "SSSMID", hi: "समग्र आईडी" },
                      { en: "SCHOLAR NO.", hi: "प्रवेश क्रमांक" },
                      { en: "SCHOOL CODE", hi: "संस्था क्रमांक" },
                      { en: "MEDIUM", hi: "माध्यम" },
                    ].map((item, i) => (
                      <th key={i} className={`border-b border-r px-1.5 py-[5px] text-center font-bold ${i === 5 ? "border-r-0" : ""}`} style={{ borderColor: borderLight }}>
                        <L en={item.en} hi={item.hi} medium={medium} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {[
                      student.rollNumber, student.enrolmentNumber, student.samagraId,
                      student.scholarNumber, schoolConfig.schoolCode,
                      medium === "Hindi" ? "HINDI" : "ENGLISH",
                    ].map((val, i) => (
                      <td key={i} className={`border-r px-1.5 py-[5px] text-center font-bold ${i === 5 ? "border-r-0" : ""}`} style={{ borderColor: borderLight }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>

              {/* A4: Personal Info + Photo */}
              <div className="flex">
                <div className="flex-1 px-4 py-3 space-y-[4px] text-[11px]">
                  {[
                    { label: isHindi ? "श्री/श्रीमती/कुमारी SHRI/SMT/KUMARI" : "SHRI/SMT/KUMARI", value: student.fullName },
                    { label: isHindi ? "पिता का नाम श्री FATHER'S NAME SHRI" : "FATHER'S NAME SHRI", value: student.fatherName },
                    { label: isHindi ? "माता का नाम श्रीमती MOTHER'S NAME SMT." : "MOTHER'S NAME SMT.", value: student.motherName },
                    { label: isHindi ? "जन्म तिथि DATE OF BIRTH" : "DATE OF BIRTH", value: formatDate(student.dateOfBirth) },
                  ].map((item, i) => (
                    <p key={i}>
                      <span className="font-semibold text-[#444]">{item.label} - </span>
                      <span className="font-extrabold ml-2 text-[#111]">{item.value}</span>
                    </p>
                  ))}
                </div>
                <div className="w-[90px] flex items-center justify-center p-2 shrink-0" style={{ borderLeft: `1.5px solid ${borderColor}` }}>
                  {student.photo ? (
                    <img src={student.photo} alt="Student" className="w-[74px] h-[90px] object-cover border border-[#999] rounded-sm" />
                  ) : (
                    <div className="w-[74px] h-[90px] border border-[#999] flex items-center justify-center bg-white" />
                  )}
                </div>
              </div>
            </div>
            {/* END BOX A */}

            {/* ======== BOX B: Educational Performance ======== */}
            <div className="relative z-[10] border-[1.5px] border-[${borderColor}] mb-[5px]">
              <table className="w-full border-collapse text-[8.5px]">
                <thead>
                  {/* Title */}
                  <tr>
                    <th
                      colSpan={13}
                      className="py-2 text-center font-extrabold text-[12px] tracking-[0.08em]"
                      style={{ background: headerBg, borderBottom: `1.5px solid ${borderColor}`, color: navy }}
                    >
                      <L en="EDUCATIONAL PERFORMANCE" hi="शैक्षणिक प्रदर्शन" medium={medium} />
                    </th>
                  </tr>

                  {/* Header Row 1 */}
                  <tr style={{ background: headerBg }}>
                    <th rowSpan={3} className={`${th} w-[88px] align-middle`} style={{ background: headerBg }}>
                      <L en="SUBJECT" hi="विषय" medium={medium} />
                    </th>
                    <th colSpan={2} className={th} style={{ background: headerBg }}>
                      <L en="MAXIMUM MARKS" hi="अधिकतम अंक" medium={medium} />
                    </th>
                    <th colSpan={2} className={th} style={{ background: headerBg }}>
                      <L en="MINIMUM MARKS" hi="न्यूनतम अंक" medium={medium} />
                    </th>
                    <th rowSpan={3} className={`${th} w-[40px] text-[7px] leading-tight align-middle`} style={{ background: headerBg }}>
                      <L en="ANNUAL OBTAINED MARKS THEORY" hi="वार्षिक परीक्षा प्राप्तांक सैद्धांतिक" medium={medium} />
                    </th>
                    <th colSpan={3} className={th} style={{ background: cream }}>
                      <span className="text-[7.5px]">
                        <L en="PRACTICAL / PROJECT" hi="प्रायोगिक/प्रोजेक्ट" medium={medium} />
                      </span>
                    </th>
                    <th colSpan={2} className={th} style={{ background: headerBg }}>
                      <span className="text-[7px] leading-tight">TOTAL<br />(IN ROUND)</span>
                    </th>
                    <th rowSpan={3} className={`${th} w-[40px] align-middle text-[7px] leading-tight`} style={{ background: headerBg }}>
                      GRAND<br />TOTAL
                    </th>
                    <th rowSpan={3} className={`${th} w-[40px] align-middle text-[7.5px] leading-tight`} style={{ background: headerBg }}>
                      <L en="REMARKS" hi="विशेष" medium={medium} />
                    </th>
                  </tr>

                  {/* Header Row 2 */}
                  <tr style={{ background: headerBg }}>
                    <th rowSpan={2} className={`${th} w-[24px]`} style={{ background: headerBg }}>TH</th>
                    <th rowSpan={2} className={`${th} w-[24px]`} style={{ background: headerBg }}>PR</th>
                    <th rowSpan={2} className={`${th} w-[24px]`} style={{ background: headerBg }}>TH</th>
                    <th rowSpan={2} className={`${th} w-[24px]`} style={{ background: headerBg }}>PR</th>
                    <th className={`${th} text-[7px] leading-tight w-[40px]`} style={{ background: cream }}>
                      <L en="ANNUAL OBTAINED MARKS PRACTICAL/PROJECT" hi="वार्षिक परीक्षा प्राप्तांक प्रायोगिक/प्रोजेक्ट" medium={medium} />
                    </th>
                    <th className={`${th} text-[6.5px] leading-tight w-[48px]`} style={{ background: cream }}>
                      <L en="(TH+PR) 5% WEIGHTAGE OF QUARTERLY EXAM" hi="त्रैमासिक परीक्षा का 5% अधिभार (TH+PR)" medium={medium} />
                    </th>
                    <th className={`${th} text-[6.5px] leading-tight w-[48px]`} style={{ background: cream }}>
                      <L en="(TH+PR) 5% WEIGHTAGE OF HALF YEARLY EXAM" hi="अर्धवार्षिक परीक्षा का 5% अधिभार (TH+PR)" medium={medium} />
                    </th>
                    <th rowSpan={2} className={`${th} w-[28px]`} style={{ background: headerBg }}>TH</th>
                    <th rowSpan={2} className={`${th} w-[28px]`} style={{ background: headerBg }}>
                      PR<br /><span className="text-[6.5px]">(I+II+III)</span>
                    </th>
                  </tr>

                  {/* Header Row 3 */}
                  <tr style={{ background: cream }}>
                    <th className={th} style={{ background: cream }}>(I)</th>
                    <th className={th} style={{ background: cream }}>(II)</th>
                    <th className={th} style={{ background: cream }}>(III)</th>
                  </tr>
                </thead>

                <tbody>
                  {subjectRows.map(({ subject, calc, remarks }, idx) => (
                    <tr key={subject.code} style={{ background: idx % 2 === 1 ? rowAlt : "white" }}>
                      <td className={`${b} px-1.5 py-[5px] font-bold text-[9.5px]`}>
                        ({subject.code}) {isHindi ? subject.nameHindi : subject.name}
                      </td>
                      <td className={tb}>{schoolConfig.maxMarksTH}</td>
                      <td className={tb}>{schoolConfig.maxMarksPR}</td>
                      <td className={tc}>{schoolConfig.minMarksTH}</td>
                      <td className={tc}>{schoolConfig.minMarksPR}</td>
                      <td className={tb}>{calc.annualTheory || ""}</td>
                      <td className={tc}>{calc.annualProject || ""}</td>
                      <td className={tc}>{calc.quarterlyWeightage ? calc.quarterlyWeightage.toFixed(2) : ""}</td>
                      <td className={tc}>{calc.halfYearlyWeightage ? calc.halfYearlyWeightage.toFixed(2) : ""}</td>
                      <td className={tb}>{calc.theoryRound || ""}</td>
                      <td className={tb}>{calc.practicalRound || ""}</td>
                      <td className={`${tb} text-[10px]`}>{calc.grandTotal || ""}</td>
                      <td className={`${tc} font-semibold text-[8.5px]`} style={{ color: remarks === "DISTN" ? navy : undefined }}>
                        {remarks}
                      </td>
                    </tr>
                  ))}

                  {/* TOTAL ROW */}
                  <tr className="font-extrabold" style={{ background: headerBg }}>
                    <td className={`${tb} text-[10px]`}>TOTAL</td>
                    <td className={tb}>{schoolConfig.maxMarksTH * 6}</td>
                    <td className={tb}>{schoolConfig.maxMarksPR * 6}</td>
                    <td className={tb}>{schoolConfig.minMarksTH * 6}</td>
                    <td className={tb}>{schoolConfig.minMarksPR * 6}</td>
                    <td className={tc} colSpan={4}></td>
                    <td className={tb}>{totalTH}</td>
                    <td className={tb}>{totalPR}</td>
                    <td className={`${tb} text-[13px]`} style={{ color: navy }}>{Math.round(result.totalMarks)}</td>
                    <td className={tc}></td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* END BOX B */}

            {/* ======== BOX C: Result Summary + Total in Words ======== */}
            <div className="relative z-[10] border-[1.5px] border-[${borderColor}] mb-[5px]">
              <table className="w-full border-collapse text-[8.5px]">
                <thead>
                  <tr style={{ background: headerBg }}>
                    {[
                      { en: "PUBLISH DATE", hi: "प्रकाशित तिथि" },
                      { en: "EXAM RESULT", hi: "परीक्षा परिणाम" },
                      { en: "MAX. MARKS", hi: "पूर्णांक" },
                      { en: "TOTAL MARKS", hi: "कुल प्राप्तांक" },
                      { en: "PERCENTAGE", hi: "प्रतिशत" },
                      { en: "GRADE", hi: "ग्रेड" },
                      { en: "DIVISION", hi: "श्रेणी" },
                    ].map((item, i) => (
                      <th key={i} className={`${th} border-t-0 ${i === 0 ? "border-l-0" : ""}`} style={{ background: headerBg }}>
                        <L en={item.en} hi={item.hi} medium={medium} />
                      </th>
                    ))}
                    <th
                      rowSpan={2}
                      className="border-l text-center px-2 py-1.5 align-middle w-[120px]"
                      style={{ borderColor: borderColor, background: cream, borderTop: "none" }}
                    >
                      <span className="text-[7.5px] font-bold leading-tight block" style={{ color: navy }}>
                        <L en="ENVIRONMENTAL EDUCATION & DISASTER MANAGEMENT GRADE" hi="पर्यावरण शिक्षा एवं आपदा प्रबंधन" medium={medium} />
                      </span>
                      <span className="text-[20px] font-extrabold block mt-1" style={{ color: navy }}>
                        {student.overrides.envEducationGrade || "A+"}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={`${tb} border-l-0`}>{formatDate(student.publishDate)}</td>
                    <td className={tb} style={{ color: result.result === "PASS" ? "#166534" : "#991b1b" }}>{result.result}</td>
                    <td className={`${tb} text-[12px]`}>{result.maxMarks}</td>
                    <td className={`${tb} text-[13px]`} style={{ color: navy }}>{Math.round(result.totalMarks)}</td>
                    <td className={`${tb} text-[11px]`}>{result.percentage.toFixed(1)}</td>
                    <td className={`${tb} text-[14px]`} style={{ color: navy }}>{result.grade}</td>
                    <td className={tb}>{result.division}</td>
                  </tr>
                </tbody>
              </table>

              <div className="px-4 py-2.5 text-[10.5px]" style={{ borderTop: `1.5px solid ${borderColor}` }}>
                <span className="font-bold text-[#444]">{isHindi && "कुल प्राप्तांक शब्दों में "}TOTAL MARKS IN WORDS - </span>
                <span className="font-extrabold tracking-wide">{student.overrides.totalInWords || result.totalInWords}</span>
              </div>
            </div>
            {/* END BOX C */}

            {/* ======== BOX D: Signatures ======== */}
            <div className="relative z-[10] border-[1.5px] border-[${borderColor}] mb-[5px]">
              <div className="flex justify-between px-6 pt-12 pb-4">
                {[
                  { en: "SIGNATURE OF CLASS TEACHER", hi: "कक्षा अध्यापक के हस्ताक्षर", name: student.classTeacherName },
                  { en: "SIGNATURE OF EXAM INCHARGE", hi: "परीक्षा प्रभारी के हस्ताक्षर", name: student.examInchargeName },
                  { en: "SEAL AND SIGNATURE OF PRINCIPAL", hi: "प्राचार्य के हस्ताक्षर एवं मोहर", name: student.principalName },
                ].map((sig, i) => (
                  <div key={i} className="text-center">
                    <div className="w-44 border-b-[1.5px] border-[#333] mb-2" />
                    <p className="font-bold text-[9px] text-[#444]"><L en={sig.en} hi={sig.hi} medium={medium} /></p>
                    {sig.name && <p className="text-[9px] mt-1 font-bold text-[#111]">{sig.name}</p>}
                  </div>
                ))}
              </div>
            </div>
            {/* END BOX D */}

            {/* ======== BOX E: Division / Grade Scale ======== */}
            <div className="relative z-[10] border-[1.5px] border-[${borderColor}]">
              <table className="w-full border-collapse text-[8px]">
                <tbody>
                  <tr style={{ background: headerBg }}>
                    <td className={`${b} border-t-0 border-l-0 font-bold px-2 py-1.5 w-[70px]`}>
                      <L en="DIVISION" hi="श्रेणी" medium={medium} />
                    </td>
                    <td colSpan={4} className={`${tc} border-t-0 font-bold`}>{isHindi && "प्रथम श्रेणी "}(FIRST DIVISION: ≥60%)</td>
                    <td colSpan={2} className={`${tc} border-t-0 font-bold`}>{isHindi && "द्वितीय श्रेणी "}(SECOND: 45-59.9%)</td>
                    <td colSpan={2} className={`${tc} border-t-0 border-r-0 font-bold`}>{isHindi && "तृतीय श्रेणी "}(THIRD DIVISION: 33-44.9%)</td>
                  </tr>
                  <tr>
                    <td className={`${b} border-l-0 font-bold px-2 py-1.5`}>{isHindi && "प्राप्तांक प्रतिशत "}PERCENTAGE</td>
                    <td className={tc}>85% to 100%</td>
                    <td className={tc}>76% to 84.9%</td>
                    <td className={tc}>66% to 75.9%</td>
                    <td className={tc}>56% to 65.9%</td>
                    <td className={tc}>51% to 55.9%</td>
                    <td className={tc}>46% to 50.9%</td>
                    <td className={tc}>33% to 45.9%</td>
                    <td className={`${tc} border-r-0`}>Below 33%</td>
                  </tr>
                  <tr style={{ background: rowAlt }}>
                    <td className={`${b} border-l-0 border-b-0 font-bold px-2 py-1.5`}>GRADE {isHindi && "(ग्रेड)"}</td>
                    <td className={`${tb} border-b-0`} style={{ color: navy }}>A+</td>
                    <td className={`${tb} border-b-0`} style={{ color: navy }}>A</td>
                    <td className={`${tb} border-b-0`} style={{ color: navy }}>B+</td>
                    <td className={`${tb} border-b-0`} style={{ color: navy }}>B</td>
                    <td className={`${tb} border-b-0`} style={{ color: navy }}>C+</td>
                    <td className={`${tb} border-b-0`} style={{ color: navy }}>C</td>
                    <td className={`${tb} border-b-0`} style={{ color: navy }}>D</td>
                    <td className={`${tb} border-b-0 border-r-0`} style={{ color: "#991b1b" }}>E</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* END BOX E */}

          </div>
        </div>
        {/* END OUTER DOUBLE BORDER */}
      </div>
    </div>
  );
}
