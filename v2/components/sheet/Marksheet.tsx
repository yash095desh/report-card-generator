"use client";
/* eslint-disable @next/next/no-img-element -- the sheet is printed; plain <img> keeps print layout predictable */
import { useLayoutEffect, useRef, useState } from "react";
import type { ClassKey, Column, GradeRow, Marks, Session, Student } from "@/lib/types";
import type { Result } from "@/lib/rules/marks";
import { formatPct } from "@/lib/rules/marks";
import { GRADES } from "@/lib/rules/grades";
import { dobWords, formatDate } from "@/lib/rules/words";
import { classLabel, isSampleClass, nextClass, templateFor } from "@/lib/templates";
import { CO_SCHOLASTIC, SOCIAL_QUALITIES } from "@/lib/templates/school-exams";
import { SCHOOL } from "@/lib/school";
import { Bi } from "./Bi";
import { PerformanceTable } from "./PerformanceTable";

export interface MarksheetProps {
  cls: ClassKey;
  student: Student;
  session: Session;
  result: Result;
  columns: Column[];
  marks: Marks;
  /** Grade-only rows (EE&DM, Drawing): row name → grade. */
  gradeRows: Record<string, string>;
  /** Co-scholastic and social-quality grades: item → grade. */
  co: Record<string, string>;
  /** Told whether the sheet still runs past one A4 page even with compact spacing. */
  onOverflowChange?: (overflow: boolean) => void;
}

/** Usable height of an A4 page inside the paper's 6 mm margins: (297 − 12) mm at 96 px per inch. */
export const A4_CONTENT_PX = Math.floor(((297 - 12) / 25.4) * 96);

export function Marksheet({ cls, student: s, session: ss, result, columns, marks, gradeRows, co, onOverflowChange }: MarksheetProps) {
  const t = templateFor(cls);
  const hindi = s.medium === "Hindi";

  // Fit to one A4 page: switch to compact spacing when the normal layout is too tall. The decision is
  // remembered per layout (class, subjects, medium) so it resets when the sheet gets shorter again.
  const sheetRef = useRef<HTMLDivElement>(null);
  const layoutKey = `${cls}|${result.rows.length}|${columns.length}|${hindi}|${s.dob ? 1 : 0}|${s.attPresent || s.attTotal ? 1 : 0}`;
  const [tightFor, setTightFor] = useState<string | null>(null);
  const compact = hindi || tightFor === layoutKey;
  // Runs after every render on purpose: any text change can change the height. It only sets state
  // once per layout (when switching to compact), so it can't loop.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const h = sheetRef.current?.offsetHeight ?? 0;
    if (!compact && h > A4_CONTENT_PX) {
      setTightFor(layoutKey);
      return;
    }
    onOverflowChange?.(h > A4_CONTENT_PX);
  });
  const show = result.anyEntered && !result.anyInvalid;
  const rows = t.gradeRows(cls);

  const ids: [string, string, string][] = [
    ["ROLL NO.", "अनुक्रमांक", s.roll],
    ...(t.showEnrolment ? [["ENROLMENT NO.", "नामांकन क्रमांक", s.enrolment] as [string, string, string]] : []),
    ["SSSMID", "समग्र आईडी", s.samagra],
    ["SCHOLAR NO.", "प्रवेश क्रमांक", s.scholar],
    ...(t.showCategory ? [["CATEGORY", "वर्ग", s.category.toUpperCase()] as [string, string, string]] : []),
    ["SCHOOL CODE", "संस्था क्रमांक", SCHOOL.code],
    ["MEDIUM", "माध्यम", hindi ? "HINDI" : "ENGLISH"],
  ];

  const who: [string, string][] = [
    [hindi ? "श्री/श्रीमती/कुमारी SHRI/SMT/KUMARI" : "SHRI/SMT/KUMARI", s.fullName],
    [hindi ? "पिता का नाम श्री FATHER'S NAME SHRI" : "FATHER'S NAME SHRI", s.fatherName],
    [hindi ? "माता का नाम श्रीमती MOTHER'S NAME SMT." : "MOTHER'S NAME SMT.", s.motherName],
    [hindi ? "जन्म तिथि DATE OF BIRTH" : "DATE OF BIRTH", formatDate(s.dob)],
  ];
  if (t.dobWords && s.dob) who.push([hindi ? "जन्म तिथि (शब्दों में) IN WORDS" : "DATE OF BIRTH IN WORDS", dobWords(s.dob)]);
  if (s.attPresent !== "" || s.attTotal !== "") {
    who.push([hindi ? "उपस्थिति ATTENDANCE" : "ATTENDANCE", `${s.attPresent || "–"} / ${s.attTotal || "–"}`]);
  }

  const heads: [string, string][] = [
    ["PUBLISH DATE", "प्रकाशित तिथि"],
    ["EXAM RESULT", "परीक्षा परिणाम"],
    ["MAX. MARKS", "पूर्णांक"],
    ["TOTAL MARKS", "कुल प्राप्तांक"],
    ["PERCENTAGE", "प्रतिशत"],
    ["GRADE", "ग्रेड"],
    ...(t.division ? [["DIVISION", "श्रेणी"] as [string, string]] : []),
    ...(t.promote ? [["PROMOTED TO CLASS", "अगली कक्षा"] as [string, string]] : []),
  ];

  const [user, domain] = SCHOOL.email.split("@");

  return (
    <div ref={sheetRef} className={`sheet${compact ? " compact" : ""}`}>
      <div className="sh-outer">
        <div className="sh-inner">
          <div className="sh-wm">
            <img src={SCHOOL.logo} alt="" />
          </div>

          {/* Header, exam line, IDs, student details */}
          <div className="sh-box">
            <div className="sh-head">
              <div className="sh-logo">
                <img src={SCHOOL.logo} alt="School logo" />
              </div>
              <div className="sh-title">
                <h1>{SCHOOL.name}</h1>
                <p className="addr">{SCHOOL.address}</p>
                <p className="dist">DISTRICT - {SCHOOL.district}</p>
                <div className="sh-div">
                  <i />
                  <b />
                  <i />
                </div>
                <p className="ms">
                  {hindi && <span className="msh">अंकसूची</span>}
                  MARKSHEET
                </p>
              </div>
              <div className="sh-codes">
                <div>
                  <span>School Code</span>
                  <p>{SCHOOL.code}</p>
                </div>
                <div>
                  <span>DISE Code</span>
                  <p>{SCHOOL.dise}</p>
                </div>
                <div>
                  <span>Email</span>
                  <p>
                    <span>{user}</span>
                    <wbr />
                    <span>@{domain}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="sh-meta">
              <div>{ss.month} - ({ss.examYear})</div>
              <div>CLASS - {classLabel(cls)}</div>
              <div>SESSION - {ss.year}</div>
              <div>DISE CODE - {SCHOOL.dise}</div>
            </div>
            <table className="sh-ids">
              <thead>
                <tr>
                  {ids.map(([en, hi]) => (
                    <th key={en}><Bi en={en} hi={hi} hindi={hindi} /></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {ids.map(([en, , v]) => (
                    <td key={en}>{v}</td>
                  ))}
                </tr>
              </tbody>
            </table>
            <div className="sh-info">
              <div className="who">
                {who.map(([label, value]) => (
                  <p key={label}>
                    <span className="l">{label} - </span>
                    <span className="v">{value}</span>
                  </p>
                ))}
              </div>
              <div className="ph">{s.photo ? <img src={s.photo} alt="" /> : <div />}</div>
            </div>
          </div>

          {/* Marks */}
          <div className="sh-box">
            <PerformanceTable template={t} result={result} columns={columns} marks={marks} hindi={hindi} />
          </div>

          {t.coScholastic && (
            <div className="sh-box sh-cobox">
              <CoTable en="EVALUATION OF CO-SCHOLASTIC AREA" hi="सह-शैक्षिक क्षेत्र का मूल्यांकन" list={CO_SCHOLASTIC} co={co} hindi={hindi} />
              <CoTable en="INDIVIDUAL EVALUATION OF SOCIAL QUALITIES" hi="सामाजिक गुणों का व्यक्तिगत मूल्यांकन" list={SOCIAL_QUALITIES} co={co} hindi={hindi} />
            </div>
          )}

          {/* Result */}
          <div className="sh-box">
            <table className="sh-res">
              <tbody>
                <tr>
                  {heads.map(([en, hi]) => (
                    <th key={en}><Bi en={en} hi={hi} hindi={hindi} /></th>
                  ))}
                  {rows.length > 0 && <GradeRowsCell rows={rows} gradeRows={gradeRows} hindi={hindi} />}
                </tr>
                <tr>
                  <td>{formatDate(ss.publish)}</td>
                  <td style={{ color: result.passed ? "#166534" : "#991b1b" }}>{show ? result.result : ""}</td>
                  <td style={{ fontSize: 12 }}>{result.max}</td>
                  <td style={{ fontSize: 13, color: "#1a2a5e" }} data-c="total">{show ? result.total : ""}</td>
                  <td style={{ fontSize: 11 }}>{show ? formatPct(t, result.pct) : ""}</td>
                  <td style={{ fontSize: 14, color: "#1a2a5e" }}>{show ? result.grade : ""}</td>
                  {t.division && <td>{show ? result.division : ""}</td>}
                  {t.promote && <td>{show ? (result.passed ? nextClass(cls) : "–") : ""}</td>}
                </tr>
              </tbody>
            </table>
            <div className="sh-words">
              <span className="l">{hindi ? "कुल प्राप्तांक शब्दों में " : ""}TOTAL MARKS IN WORDS - </span>
              <span className="v">{show ? result.words : ""}</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="sh-box">
            <div className={`sh-sign${t.examIncharge ? " three" : ""}`}>
              <Signature en="SIGNATURE OF CLASS TEACHER" hi="कक्षा अध्यापक के हस्ताक्षर" name={ss.teacher} hindi={hindi} />
              {t.examIncharge && <Signature en="SIGNATURE OF EXAM IN-CHARGE" hi="परीक्षा प्रभारी के हस्ताक्षर" name={ss.incharge} hindi={hindi} />}
              <Signature en="SEAL AND SIGNATURE OF PRINCIPAL" hi="प्राचार्य के हस्ताक्षर एवं मोहर" name={ss.principal} hindi={hindi} />
            </div>
          </div>

          {/* Grade and division scale */}
          <div className="sh-box">
            <table className="sh-scale">
              <tbody>
                {t.division && (
                  <tr className="hd">
                    <td className="h"><Bi en="DIVISION" hi="श्रेणी" hindi={hindi} /></td>
                    <td colSpan={4}>{hindi ? "प्रथम श्रेणी " : ""}(FIRST DIVISION: ≥60%)</td>
                    <td colSpan={2}>{hindi ? "द्वितीय श्रेणी " : ""}(SECOND: 45-59.9%)</td>
                    <td colSpan={2}>{hindi ? "तृतीय श्रेणी " : ""}(THIRD DIVISION: 33-44.9%)</td>
                  </tr>
                )}
                <tr>
                  <td className="h">{hindi ? "प्राप्तांक प्रतिशत " : ""}PERCENTAGE</td>
                  {["85% to 100%", "76% to 84.9%", "66% to 75.9%", "56% to 65.9%", "51% to 55.9%", "46% to 50.9%", "33% to 45.9%", "Below 33%"].map((r) => (
                    <td key={r}>{r}</td>
                  ))}
                </tr>
                <tr className="alt">
                  <td className="h">GRADE {hindi ? "(ग्रेड)" : ""}</td>
                  {GRADES.map((g) => (
                    <td key={g} className={g === "E" ? "ge" : "g"}>{g}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isSampleClass(t, cls) && <p className="sh-sample">SAMPLE SUBJECT LIST – TO BE CONFIRMED WITH SCHOOL</p>}
    </div>
  );
}

function GradeRowsCell({ rows, gradeRows, hindi }: { rows: GradeRow[]; gradeRows: Record<string, string>; hindi: boolean }) {
  if (rows.length === 1 && rows[0].big) {
    return (
      <th rowSpan={2} className="env">
        <span><Bi en={rows[0].en} hi={rows[0].hi} hindi={hindi} /></span>
        <strong>{gradeRows[rows[0].en] ?? ""}</strong>
      </th>
    );
  }
  return (
    <th rowSpan={2} className="envlist">
      {rows.map((g) => (
        <div key={g.en}>
          <span>{hindi ? `${g.hi} ` : ""}{g.en}</span>
          <b>{gradeRows[g.en] || " "}</b>
        </div>
      ))}
    </th>
  );
}

function CoTable({ en, hi, list, co, hindi }: { en: string; hi: string; list: GradeRow[]; co: Record<string, string>; hindi: boolean }) {
  return (
    <table className="sh-co">
      <thead>
        <tr>
          <th><Bi en={en} hi={hi} hindi={hindi} /></th>
          <th><Bi en="GRADE" hi="ग्रेड" hindi={hindi} /></th>
        </tr>
      </thead>
      <tbody>
        {list.map((g) => (
          <tr key={g.en}>
            <td>{hindi ? `${g.hi} / ` : ""}{g.en}</td>
            <td className="g">{co[g.en] ?? ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Signature({ en, hi, name, hindi }: { en: string; hi: string; name: string; hindi: boolean }) {
  return (
    <div>
      <i />
      <p><Bi en={en} hi={hi} hindi={hindi} /></p>
      {name && <p className="n">{name}</p>}
    </div>
  );
}
