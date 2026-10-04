import type { Column, Marks, Subject, Template } from "@/lib/types";
import type { Result, SubjectRow } from "@/lib/rules/marks";
import { getGrade } from "@/lib/rules/grades";
import { BOARD75 } from "@/lib/templates/secondary";
import { Bi } from "./Bi";

interface Props {
  template: Template;
  result: Result;
  columns: Column[];
  marks: Marks;
  hindi: boolean;
}

const subjectName = (s: Subject, hindi: boolean) => `${s.code ? `(${s.code}) ` : ""}${hindi ? s.hi : s.name}`;

/** One decimal at most, whole numbers without ".0". */
const fmtMark = (n: number) => {
  const x = Math.round(n * 10) / 10;
  return Number.isInteger(x) ? String(x) : x.toFixed(1);
};

const rowTotal = (r: SubjectRow) => (r.total == null ? "–" : r.entered ? r.total : "");

/** A marks cell. A mark above its maximum is shown as typed, in red, so the teacher sees where it is. */
function MarkCell({ row, colKey, text, className = "", marks }: { row: SubjectRow; colKey: string; text: string | number; className?: string; marks: Marks }) {
  const bad = row.invalid.find((c) => c.key === colKey);
  if (bad) {
    return (
      <td className={`${className} bad`} data-c={`${row.subject.id}:${colKey}`} title={`Maximum is ${bad.max}`}>
        {marks[row.subject.id]?.[colKey]}
      </td>
    );
  }
  return (
    <td className={`${className}${text === "AB" ? " ab" : ""}`} data-c={`${row.subject.id}:${colKey}`}>
      {text}
    </td>
  );
}

function Title({ span, hindi }: { span: number; hindi: boolean }) {
  return (
    <tr>
      <th colSpan={span} className="ttl">
        <Bi en="EDUCATIONAL PERFORMANCE" hi="शैक्षणिक प्रदर्शन" hindi={hindi} />
      </th>
    </tr>
  );
}

export function PerformanceTable(props: Props) {
  return props.template.rule === "board75" ? <Board75Table {...props} /> : <SchoolTable {...props} />;
}

/** Classes 9–10: the MP Board TH/PR layout of the school's Class 9 sheet. */
function Board75Table({ result, marks, hindi }: Props) {
  const rows = result.rows;
  const n = rows.length;
  const show = result.anyEntered && !result.anyInvalid;
  const thT = rows.reduce((a, r) => a + (r.thR ?? 0), 0);
  const prT = rows.reduce((a, r) => a + (r.prR ?? 0), 0);
  return (
    <table className="sh-perf">
      <thead>
        <Title span={13} hindi={hindi} />
        <tr>
          <th rowSpan={3} style={{ width: 88 }}><Bi en="SUBJECT" hi="विषय" hindi={hindi} /></th>
          <th colSpan={2}><Bi en="MAXIMUM MARKS" hi="अधिकतम अंक" hindi={hindi} /></th>
          <th colSpan={2}><Bi en="MINIMUM MARKS" hi="न्यूनतम अंक" hindi={hindi} /></th>
          <th rowSpan={3} className="tiny" style={{ width: 40 }}>
            <Bi en="ANNUAL OBTAINED MARKS THEORY" hi="वार्षिक परीक्षा प्राप्तांक सैद्धांतिक" hindi={hindi} />
          </th>
          <th colSpan={3} className="cr" style={{ fontSize: 7.5 }}>
            <Bi en="PRACTICAL / PROJECT" hi="प्रायोगिक/प्रोजेक्ट" hindi={hindi} />
          </th>
          <th colSpan={2} className="tiny">TOTAL<br />(IN ROUND)</th>
          <th rowSpan={3} className="tiny" style={{ width: 40 }}>GRAND<br />TOTAL</th>
          <th rowSpan={3} style={{ width: 40, fontSize: 7.5 }}><Bi en="REMARKS" hi="विशेष" hindi={hindi} /></th>
        </tr>
        <tr>
          <th rowSpan={2} style={{ width: 24 }}>TH</th>
          <th rowSpan={2} style={{ width: 24 }}>PR</th>
          <th rowSpan={2} style={{ width: 24 }}>TH</th>
          <th rowSpan={2} style={{ width: 24 }}>PR</th>
          <th className="cr tiny" style={{ width: 40 }}>
            <Bi en="ANNUAL OBTAINED MARKS PRACTICAL/PROJECT" hi="वार्षिक परीक्षा प्राप्तांक प्रायोगिक/प्रोजेक्ट" hindi={hindi} />
          </th>
          <th className="cr tinier" style={{ width: 48 }}>
            <Bi en="(TH+PR) 5% WEIGHTAGE OF QUARTERLY EXAM" hi="त्रैमासिक परीक्षा का 5% अधिभार (TH+PR)" hindi={hindi} />
          </th>
          <th className="cr tinier" style={{ width: 48 }}>
            <Bi en="(TH+PR) 5% WEIGHTAGE OF HALF YEARLY EXAM" hi="अर्धवार्षिक परीक्षा का 5% अधिभार (TH+PR)" hindi={hindi} />
          </th>
          <th rowSpan={2} style={{ width: 28 }}>TH</th>
          <th rowSpan={2} style={{ width: 28 }}>PR<br /><span className="tinier">(I+II+III)</span></th>
        </tr>
        <tr>
          <th className="cr">(I)</th>
          <th className="cr">(II)</th>
          <th className="cr">(III)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const ok = r.total != null;
          const has = ok && r.entered > 0;
          return (
            <tr key={r.subject.id}>
              <td className="sub">{subjectName(r.subject, hindi)}</td>
              <td className="b">{BOARD75.maxTH}</td>
              <td className="b">{BOARD75.maxPR}</td>
              <td>{BOARD75.minTH}</td>
              <td>{BOARD75.minPR}</td>
              <MarkCell row={r} colKey="aw" text={ok ? r.cells.aw : ""} className="b" marks={marks} />
              <MarkCell row={r} colKey="pw" text={ok ? r.cells.pw : ""} marks={marks} />
              <MarkCell row={r} colKey="q" text={ok ? r.cells.q : ""} marks={marks} />
              <MarkCell row={r} colKey="hy" text={ok ? r.cells.hy : ""} marks={marks} />
              <td className={`b${has && (r.thR ?? 0) < BOARD75.minTH ? " bad" : ""}`}>{has ? r.thR : ""}</td>
              <td className={`b${has && (r.prR ?? 0) < BOARD75.minPR ? " bad" : ""}`}>{has ? r.prR : ""}</td>
              <td className="b gt" data-c={`${r.subject.id}:total`}>{rowTotal(r)}</td>
              <td className={`rm${r.remark === "DISTN" ? " d" : ""}`}>{r.remark}</td>
            </tr>
          );
        })}
        <tr className="total">
          <td className="b" style={{ fontSize: 10 }}>TOTAL</td>
          <td>{BOARD75.maxTH * n}</td>
          <td>{BOARD75.maxPR * n}</td>
          <td>{BOARD75.minTH * n}</td>
          <td>{BOARD75.minPR * n}</td>
          <td colSpan={4} />
          <td>{show ? thT : ""}</td>
          <td>{show ? prT : ""}</td>
          <td style={{ fontSize: 13, color: "#1a2a5e" }}>{show ? result.total : ""}</td>
          <td />
        </tr>
      </tbody>
    </table>
  );
}

/** Nursery–8: Max/Obt per exam, then the weightage-based result out of 100 (school's current sheets). */
function SchoolTable({ result, columns, marks, hindi }: Props) {
  const rows = result.rows;
  const show = result.anyEntered && !result.anyInvalid;
  const sum = (f: (r: SubjectRow) => number) => rows.reduce((a, r) => a + f(r), 0);
  return (
    <table className="sh-perf">
      <thead>
        <Title span={1 + columns.length * 3 + 2} hindi={hindi} />
        <tr>
          <th rowSpan={2} style={{ width: 96 }}><Bi en="SUBJECT" hi="विषय" hindi={hindi} /></th>
          {columns.map((c) => (
            <th key={c.key} colSpan={2} className="tiny">
              <Bi en={`${c.label.toUpperCase()} EVALUATION`} hi={`${c.hi} मूल्यांकन`} hindi={hindi} />
            </th>
          ))}
          <th colSpan={columns.length + 2} className="cr tiny">
            <Bi en="WEIGHTAGE BASED RESULT (MAX. MARKS 100)" hi="अधिभार आधारित परिणाम (पूर्णांक 100)" hindi={hindi} />
          </th>
        </tr>
        <tr>
          {columns.map((c) => [
            <th key={`${c.key}-max`} className="tinier">MAX</th>,
            <th key={`${c.key}-obt`} className="tinier">OBT</th>,
          ])}
          {columns.map((c) => (
            <th key={`${c.key}-w`} className="cr tinier">
              {c.label.toUpperCase().replace("HALF-YEARLY", "HALF")}
              <br />({c.weight})
            </th>
          ))}
          <th className="cr tinier">TOTAL</th>
          <th className="cr tinier">GRADE</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const ok = r.total != null && r.entered > 0;
          return (
            <tr key={r.subject.id}>
              <td className="sub">{subjectName(r.subject, hindi)}</td>
              {columns.map((c) => {
                const v = r.values[c.key];
                return [
                  <td key={`${c.key}-max`}>{c.max}</td>,
                  <MarkCell key={`${c.key}-obt`} row={r} colKey={c.key} text={v.ab ? "AB" : v.blank ? "" : fmtMark(v.n)} className="b" marks={marks} />,
                ];
              })}
              {columns.map((c) => (
                <td key={`${c.key}-w`}>{ok && !r.values[c.key].blank ? r.cells[c.key] : ""}</td>
              ))}
              <td className={`b gt${ok && !r.pass ? " bad" : ""}`} data-c={`${r.subject.id}:total`}>{rowTotal(r)}</td>
              <td className="b" style={{ color: "#1a2a5e" }}>{ok && r.total != null ? getGrade(r.total) : ""}</td>
            </tr>
          );
        })}
        <tr className="total">
          <td className="b" style={{ fontSize: 10 }}>TOTAL</td>
          {columns.map((c) => [
            <td key={`${c.key}-max`}>{c.max * rows.length}</td>,
            <td key={`${c.key}-obt`}>{show ? fmtMark(sum((r) => r.values[c.key].n)) : ""}</td>,
          ])}
          {columns.map((c) => (
            <td key={`${c.key}-w`}>{show ? sum((r) => Number(r.cells[c.key] ?? 0)) : ""}</td>
          ))}
          <td style={{ fontSize: 13, color: "#1a2a5e" }}>{show ? result.total : ""}</td>
          <td>{show ? result.grade : ""}</td>
        </tr>
      </tbody>
    </table>
  );
}
