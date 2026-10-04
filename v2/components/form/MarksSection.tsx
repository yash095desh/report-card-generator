"use client";

import { Fragment, type KeyboardEvent } from "react";
import type { MarksheetApi } from "@/hooks/useMarksheet";
import { sanitizeMark } from "@/lib/rules/marks";
import { GRADES } from "@/lib/rules/grades";
import { className } from "@/lib/templates";
import { CO_SCHOLASTIC, SOCIAL_QUALITIES } from "@/lib/templates/school-exams";
import { titleCase } from "@/lib/text";
import { Icon } from "@/components/Icon";
import { Segmented, upperChange } from "./fields";

const CO_ALL = [...CO_SCHOLASTIC, ...SOCIAL_QUALITIES];

/** Enter moves down the same column; at the bottom it jumps to the top of the next column. */
function onMarkKey(e: KeyboardEvent<HTMLInputElement>) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  const el = e.currentTarget;
  const table = el.closest("table");
  if (!table) return;
  const col = el.dataset.col;
  const sameCol = [...table.querySelectorAll<HTMLInputElement>(`input[data-col="${col}"]`)];
  const next = sameCol[sameCol.indexOf(el) + 1];
  if (next) {
    next.focus();
    next.select();
    return;
  }
  const order = [...new Set([...table.querySelectorAll<HTMLInputElement>("input[data-col]")].map((i) => i.dataset.col))];
  const nextCol = order[order.indexOf(col) + 1];
  const target = nextCol ? table.querySelector<HTMLInputElement>(`input[data-col="${nextCol}"]`) : null;
  target?.focus();
  target?.select();
}

export function MarksSection({ api }: { api: MarksheetApi }) {
  const { state, template: t, columns, result, dispatch } = api;
  const editing = state.editing;
  const rowFor = new Map(result.rows.map((r) => [r.subject.id, r]));
  const gradeRows = t.gradeRows(state.cls);

  return (
    <section className="group">
      <div className="ghead">
        <h2>Marks</h2>
        <button type="button" className="linkbtn" onClick={() => dispatch({ type: "editing", on: !editing })}>
          {editing ? <Icon name="check" /> : <Icon name="pencil" />}
          {editing ? "Done editing" : "Edit subjects"}
        </button>
      </div>
      <p className="gsub">
        Type marks as written on the mark list. Type <b>AB</b> if the student was absent. Press Enter to move down.
      </p>

      {t.mathsSwitch && (
        <div className="marktools">
          <Segmented
            label="Maths paper"
            value={state.maths}
            options={[["100", "Standard (100)"], ["101", "Basic (101)"]]}
            onChange={(paper) => dispatch({ type: "maths", paper })}
          />
        </div>
      )}

      {editing && (t.maxEditable ? <ColumnsEditor api={api} /> : (
        <p className="gsub" style={{ marginTop: -6 }}>Exam columns for {className(state.cls)} are fixed by the board.</p>
      ))}

      <table className="marks">
        <thead>
          <tr>
            <th>Subject</th>
            {columns.map((c) => (
              <th key={c.key}>
                {c.label}
                <span className="mx">
                  out of {c.max}
                  {c.weight ? ` · ${c.weight}%` : ""}
                </span>
              </th>
            ))}
            <th style={{ textAlign: "right" }}>Total</th>
            {editing && <th />}
          </tr>
        </thead>
        <tbody>
          {state.subjects.map((s) => {
            const row = rowFor.get(s.id);
            const m = state.marks[s.id] ?? {};
            const failed = row && row.entered > 0 && row.total != null && !row.pass;
            return (
              <Fragment key={s.id}>
                <tr>
                  <td className="sub">
                    {editing ? (
                      <input
                        className="field name"
                        value={s.name}
                        aria-label="Subject name"
                        onChange={(e) => upperChange(e, (name) => dispatch({ type: "rename", sid: s.id, name }))}
                      />
                    ) : (
                      <>
                        {titleCase(s.name)}
                        {s.code && <small>Code {s.code}</small>}
                      </>
                    )}
                  </td>
                  {columns.map((c) => {
                    const raw = m[c.key] ?? "";
                    const invalid = !!row?.invalid.some((x) => x.key === c.key);
                    return (
                      <td key={c.key}>
                        <div className="mk">
                          <input
                            className={`field${raw === "AB" ? " ab" : ""}`}
                            data-col={c.key}
                            value={raw}
                            inputMode="decimal"
                            autoComplete="off"
                            aria-invalid={invalid}
                            aria-label={`${titleCase(s.name)} ${c.label}, out of ${c.max}`}
                            onKeyDown={onMarkKey}
                            onChange={(e) => dispatch({ type: "mark", sid: s.id, col: c.key, value: sanitizeMark(e.target.value) })}
                          />
                          <span className="of">/{c.max}</span>
                        </div>
                      </td>
                    );
                  })}
                  <td className={`tot${failed ? " fail" : ""}`}>{row?.total == null ? "–" : row.entered ? row.total : ""}</td>
                  {editing && (
                    <td>
                      <button type="button" className="rmv" aria-label={`Remove ${s.name}`} onClick={() => dispatch({ type: "removeSubject", sid: s.id })}>
                        <Icon name="x" />
                      </button>
                    </td>
                  )}
                </tr>
                {row && row.invalid.length > 0 && (
                  <tr className="errline">
                    <td colSpan={columns.length + 2}>
                      <div className="errmsg">
                        <Icon name="alert" />
                        <span>{row.invalid.map((c) => `${c.label}: maximum is ${c.max}`).join(" · ")}</span>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>

      {editing && (
        <div className="tablefoot">
          <div className="acts">
            <button type="button" className="linkbtn" onClick={() => dispatch({ type: "addSubject" })}>
              <Icon name="plus" />
              Add subject
            </button>
            {api.customised && (
              <button type="button" className="linkbtn" onClick={api.resetSetup}>
                Reset to default
              </button>
            )}
          </div>
          <span>Saved on this computer for {className(state.cls)}.</span>
        </div>
      )}

      {gradeRows.length > 0 && (
        <>
          <p className="subhead">
            Grade-only {gradeRows.length > 1 ? "subjects" : "subject"}{" "}
            <span style={{ fontWeight: 500, color: "var(--ink-3)" }}>(not added to the total)</span>
          </p>
          <div className="gradelist">
            {gradeRows.map((g) => (
              <div className="grow" key={g.en}>
                <span>{titleCase(g.en.replace(" GRADE", ""))}</span>
                <GradeSelect value={state.gradeRows[g.en] ?? ""} empty="Choose" label={`${g.en} grade`} onChange={(value) => dispatch({ type: "gradeRow", name: g.en, value })} />
              </div>
            ))}
          </div>
        </>
      )}

      {t.coScholastic && (
        <>
          <div className="cohead">
            <p className="subhead">Co-scholastic and social qualities</p>
            <label className="setall">
              Set all to
              <select
                value=""
                onChange={(e) => e.target.value && dispatch({ type: "coAll", names: CO_ALL.map((g) => g.en), value: e.target.value })}
              >
                <option value="">Choose</option>
                {GRADES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="cogrid">
            {CO_ALL.map((g) => (
              <div className="grow" key={g.en}>
                <span>{titleCase(g.en)}</span>
                <GradeSelect value={state.co[g.en] ?? ""} empty="–" label={`${g.en} grade`} onChange={(value) => dispatch({ type: "co", name: g.en, value })} />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function GradeSelect({ value, empty, label, onChange }: { value: string; empty: string; label: string; onChange: (v: string) => void }) {
  return (
    <select value={value} aria-label={label} onChange={(e) => onChange(e.target.value)}>
      <option value="">{empty}</option>
      {GRADES.map((g) => (
        <option key={g}>{g}</option>
      ))}
    </select>
  );
}

/** Nursery–8 only: rename a column, change "out of", or hide it. What each column counts for is fixed. */
function ColumnsEditor({ api }: { api: MarksheetApi }) {
  const { everyColumn, dispatch, state } = api;
  const lost = everyColumn.filter((c) => c.hidden).reduce((a, c) => a + (c.weight ?? 0), 0);
  const visibleCount = everyColumn.filter((c) => !c.hidden).length;
  return (
    <div className="colsedit">
      <p className="subhead">Exam columns</p>
      <div className="colrow head">
        <span>Name</span>
        <span>Out of</span>
        <span>Counts</span>
        <span style={{ textAlign: "center" }}>Show</span>
      </div>
      {everyColumn.map((c) => (
        <div key={`${state.cls}-${state.setupVersion}-${c.key}`} className={`colrow${c.hidden ? " off" : ""}`}>
          <input
            className="field"
            defaultValue={c.label}
            aria-label="Column name"
            onChange={(e) => dispatch({ type: "colLabel", col: c.key, label: e.target.value.trim() })}
          />
          <input
            className="field"
            defaultValue={c.max}
            inputMode="numeric"
            aria-label={`${c.label} out of`}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\D/g, "").slice(0, 3);
            }}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            onBlur={(e) => {
              const n = parseInt(e.target.value, 10);
              if (n > 0) dispatch({ type: "max", col: c.key, value: n });
              else e.target.value = String(c.max); // empty or 0: put the current maximum back
            }}
          />
          <span className="w">{c.weight}</span>
          <input
            type="checkbox"
            checked={!c.hidden}
            aria-label={`Show ${c.label}`}
            onChange={(e) => {
              if (!e.target.checked && visibleCount <= 1) return; // keep at least one column
              dispatch({ type: "colHidden", col: c.key, hidden: !e.target.checked });
            }}
          />
        </div>
      ))}
      <p className={`note${lost ? " warn" : ""}`}>
        {lost
          ? `A hidden column counts as 0, so the best possible total per subject is now ${100 - lost} out of 100.`
          : "How much each column counts is fixed. You can rename a column, change its maximum marks, or hide it."}
      </p>
    </div>
  );
}
