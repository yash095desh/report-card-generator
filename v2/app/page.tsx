"use client";
/* eslint-disable @next/next/no-img-element -- small static logo */

import { useCallback, useEffect, useState } from "react";
import { isDirty, useMarksheet } from "@/hooks/useMarksheet";
import { CLASS_ORDER, TEMPLATES, className, isSampleClass } from "@/lib/templates";
import { buildChecklist, type Issue } from "@/lib/rules/checklist";
import type { ClassKey } from "@/lib/types";
import { SCHOOL } from "@/lib/school";
import { Icon } from "@/components/Icon";
import { Desk } from "@/components/Desk";
import { Popover } from "@/components/form/Popover";
import { ResultStrip } from "@/components/form/ResultStrip";
import { SpecialCases } from "@/components/form/SpecialCases";
import { MarksSection } from "@/components/form/MarksSection";
import { SampleNotice, SessionSection, StudentSection } from "@/components/form/DetailsSections";

type Pop =
  | { kind: "clear"; anchor: HTMLElement }
  | { kind: "switch"; anchor: HTMLElement; to: ClassKey }
  | { kind: "print"; anchor: HTMLElement; issues: Issue[] };

export default function Home() {
  const api = useMarksheet();
  const { state, template: t, result, dispatch } = api;
  const [pop, setPop] = useState<Pop | null>(null);
  const [overflow, setOverflow] = useState(false);
  // What the sheet looked like when last printed, so Clear can say whether this student was printed.
  const [printedSnapshot, setPrintedSnapshot] = useState("");
  const snapshot = JSON.stringify([state.cls, state.student, state.marks, state.co, state.gradeRows, state.overrides, state.maths]);
  const printed = printedSnapshot === snapshot;
  const dirty = isDirty(state);
  const closePop = useCallback(() => setPop(null), []);

  // Warn before leaving with a student's details typed in (nothing is saved).
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  const clearStudent = () => {
    dispatch({ type: "clearStudent" });
    document.querySelector(".formscroll")?.scrollTo({ top: 0 });
  };

  const print = () => {
    // Wait for the sheet fonts so the print never falls back to another face.
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      const prev = document.title;
      // The title becomes the suggested PDF file name.
      document.title = `Marksheet - ${state.student.fullName || "Student"} - ${className(state.cls)}`;
      window.print(); // blocks until the print dialog closes
      document.title = prev;
      setPrintedSnapshot(snapshot);
    });
  };

  const onPrintClick = (anchor: HTMLElement) => {
    const issues = buildChecklist({
      template: t, cls: state.cls, student: state.student, session: state.session,
      result, gradeRows: state.gradeRows, co: state.co,
    });
    if (overflow) issues.unshift({ level: "warn", message: "The marksheet is longer than one A4 page. Remove a subject or shorten names so it prints on one page." });
    if (!issues.length) return print();
    setPop({ kind: "print", anchor, issues });
  };

  return (
    <>
      <div className="phone-guard">
        <div>
          <img src={SCHOOL.logo} alt="" />
          <h1>Please open on a computer</h1>
          <p>The marksheet maker needs a laptop or desktop screen so you can see the full A4 sheet and print it.</p>
        </div>
      </div>

      <div className="app">
        <header className="topbar">
          <div className="brand">
            <img src={SCHOOL.logo} alt="" />
            <div>
              <b>Marksheet Maker</b>
              <span>Pragya Public School</span>
            </div>
          </div>
          <div className="classpick">
            <label htmlFor="classSel">Class</label>
            <select
              id="classSel"
              value={state.cls}
              onChange={(e) => {
                const to = e.target.value as ClassKey;
                if (!dirty) api.setClass(to);
                else setPop({ kind: "switch", anchor: e.target, to });
              }}
            >
              {TEMPLATES.map((tpl) => (
                <optgroup key={tpl.id} label={tpl.id === "school" ? tpl.label : `${tpl.label} · ${tpl.range}`}>
                  {CLASS_ORDER.filter((c) => tpl.classes.includes(c)).map((c) => (
                    <option key={c} value={c}>
                      {className(c)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="spacer" style={{ flex: 1 }} />
          <button
            type="button"
            className="btn"
            onClick={(e) => (dirty ? setPop({ kind: "clear", anchor: e.currentTarget }) : clearStudent())}
          >
            <Icon name="reset" />
            Clear for next student
          </button>
          <button type="button" className="btn primary" onClick={(e) => onPrintClick(e.currentTarget)}>
            <Icon name="printer" />
            Print / Save as PDF
          </button>
        </header>

        <aside className="formcol">
          <div className="formscroll">
            {isSampleClass(t, state.cls) && <SampleNotice t={t} name={className(state.cls)} />}
            <SessionSection api={api} />
            <StudentSection api={api} />
            <MarksSection api={api} />
            <SpecialCases api={api} />
          </div>
          <ResultStrip t={t} result={result} />
        </aside>

        <Desk api={api} onOverflowChange={setOverflow} />
      </div>

      {pop?.kind === "clear" && (
        <Popover anchor={pop.anchor} onClose={closePop} label="Clear this student?">
          <h3>Clear this student?</h3>
          <p>
            {printed ? "Their sheet was printed. " : <b>Their sheet hasn&apos;t been printed or saved yet. </b>}
            Their details and marks will be removed. Class and session details stay for the next student.
          </p>
          <div className="acts">
            <button type="button" className="btn sm" data-focus onClick={closePop}>Keep editing</button>
            <button type="button" className="btn sm danger" onClick={() => { closePop(); clearStudent(); }}>Clear student</button>
          </div>
        </Popover>
      )}

      {pop?.kind === "switch" && (
        <Popover anchor={pop.anchor} onClose={closePop} label={`Switch to ${className(pop.to)}?`}>
          <h3>Switch to {className(pop.to)}?</h3>
          <p>This student&apos;s details and marks will be cleared. Session details stay.</p>
          <div className="acts">
            <button type="button" className="btn sm" data-focus onClick={closePop}>Keep editing</button>
            <button type="button" className="btn sm danger" onClick={() => { const to = pop.to; closePop(); api.setClass(to); }}>
              Switch to {className(pop.to)}
            </button>
          </div>
        </Popover>
      )}

      {pop?.kind === "print" && (
        <Popover anchor={pop.anchor} onClose={closePop} label="Before you print">
          {(() => {
            const hasErr = pop.issues.some((i) => i.level === "err");
            return (
              <>
                <h3>{hasErr ? "Fix this before printing" : "Before you print"}</h3>
                <ul>
                  {pop.issues.map((i) => (
                    <li key={i.message} className={i.level}>
                      <Icon name="alert" />
                      <span>{i.message}</span>
                    </li>
                  ))}
                </ul>
                <div className="acts">
                  <button type="button" className="btn sm" data-focus onClick={closePop}>Go back</button>
                  {!hasErr && (
                    <button type="button" className="btn sm primary" onClick={() => { closePop(); print(); }}>Print anyway</button>
                  )}
                </div>
              </>
            );
          })()}
        </Popover>
      )}
    </>
  );
}
