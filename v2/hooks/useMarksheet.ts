"use client";

import { useEffect, useMemo, useReducer } from "react";
import type { ClassKey, ColumnOverride, Format, Marks, Overrides, Session, Student, Subject, SubjectSeed } from "@/lib/types";
import { templateFor } from "@/lib/templates";
import { MATHS_BASIC, MATHS_STANDARD } from "@/lib/templates/secondary";
import { allColumns, calcResult, visibleColumns } from "@/lib/rules/marks";
import { loadFormat, resetFormat, saveFormat } from "@/lib/format-store";
import { SCHOOL } from "@/lib/school";

export type MathsPaper = "100" | "101";

export interface MarksheetState {
  cls: ClassKey;
  maths: MathsPaper;
  session: Session;
  student: Student;
  subjects: Subject[];
  marks: Marks;
  maxOv: Record<string, number>;
  colOv: Record<string, ColumnOverride>;
  /** True when this class uses a saved (edited) subject setup. */
  customised: boolean;
  /** Set by edits to subjects/columns so the setup gets saved; cleared when a class loads. */
  formatTouched: boolean;
  gradeRows: Record<string, string>;
  co: Record<string, string>;
  overrides: Overrides;
  editing: boolean;
  /** True once the teacher picks the exam month; class changes then keep their choice. */
  monthTouched: boolean;
  /** Bumped whenever a class's setup is (re)loaded, so the column editor shows fresh values. */
  setupVersion: number;
  /** The last marks box changed, so the sheet can briefly highlight it. */
  lastChanged: { sid: string; col: string; n: number } | null;
}

export const blankStudent = (): Student => ({
  fullName: "", fatherName: "", motherName: "", dob: "", category: "General", roll: "", enrolment: "",
  scholar: "", samagra: "", medium: "English", photo: "", attPresent: "", attTotal: "",
});

const blankOverrides = (): Overrides => ({ result: "", grade: "", division: "", words: "", remarks: {} });

// Ids from a class's setup are stable (class + position) so the server-rendered page matches the browser.
// Subjects added by a teacher get a unique id instead.
let added = 0;
const addedId = () => `add-${Date.now().toString(36)}-${++added}`;

const withMaths = (s: SubjectSeed, paper: MathsPaper): SubjectSeed =>
  s.maths ? { ...(paper === "101" ? MATHS_BASIC : MATHS_STANDARD) } : s;

/** Subjects, columns and empty grades for a class, from its saved setup if there is one. */
function classSetup(cls: ClassKey, maths: MathsPaper, saved: Format | null) {
  const t = templateFor(cls);
  const seeds = saved ? saved.subjects : t.subjects(cls);
  return {
    subjects: seeds.map((s, i) => ({ ...withMaths(s, maths), id: `${cls}-${i}` })),
    maxOv: saved?.maxOv ?? {},
    colOv: saved?.colOv ?? {},
    customised: !!saved,
    formatTouched: false,
    gradeRows: Object.fromEntries(t.gradeRows(cls).map((g) => [g.en, ""])),
  };
}

function initialState(): MarksheetState {
  const cls: ClassKey = "9";
  return {
    cls,
    maths: "100",
    session: {
      year: "2025-26", month: templateFor(cls).examMonth, examYear: "2026", teacher: "", incharge: "",
      principal: SCHOOL.defaultPrincipal, publish: "",
    },
    student: blankStudent(),
    marks: {},
    co: {},
    overrides: blankOverrides(),
    editing: false,
    lastChanged: null,
    monthTouched: false,
    setupVersion: 0,
    ...classSetup(cls, "100", null),
  };
}

type Action =
  | { type: "class"; cls: ClassKey; saved: Format | null }
  | { type: "applySaved"; saved: Format | null }
  | { type: "session"; field: keyof Session; value: string }
  | { type: "student"; field: keyof Student; value: string }
  | { type: "mark"; sid: string; col: string; value: string }
  | { type: "maths"; paper: MathsPaper }
  | { type: "gradeRow"; name: string; value: string }
  | { type: "co"; name: string; value: string }
  | { type: "coAll"; names: string[]; value: string }
  | { type: "override"; field: "result" | "grade" | "division" | "words"; value: string }
  | { type: "remark"; sid: string; value: string }
  | { type: "editing"; on: boolean }
  | { type: "rename"; sid: string; name: string }
  | { type: "addSubject" }
  | { type: "removeSubject"; sid: string }
  | { type: "max"; col: string; value: number }
  | { type: "colLabel"; col: string; label: string }
  | { type: "colHidden"; col: string; hidden: boolean }
  | { type: "resetFormat" }
  | { type: "clearStudent" };

/** A renamed subject keeps a proper Hindi name when it matches one of the class's own subjects. */
function hindiFor(cls: ClassKey, name: string): string {
  const match = templateFor(cls).subjects(cls).find((s) => s.name === name.trim());
  return match ? match.hi : name;
}

/** Keeps marks typed for subjects whose name survives a setup change (e.g. "Reset to default"). */
function carryMarks(from: MarksheetState, to: Subject[]): Marks {
  const byName = new Map(from.subjects.map((s) => [s.name, from.marks[s.id]]));
  const marks: Marks = {};
  for (const s of to) {
    const m = byName.get(s.name);
    if (m) marks[s.id] = m;
  }
  return marks;
}

function reducer(state: MarksheetState, a: Action): MarksheetState {
  switch (a.type) {
    case "class": {
      const prevT = templateFor(state.cls);
      const t = templateFor(a.cls);
      return {
        ...state,
        cls: a.cls,
        session: t === prevT || state.monthTouched ? state.session : { ...state.session, month: t.examMonth },
        maths: "100",
        student: blankStudent(),
        marks: {},
        co: {},
        overrides: blankOverrides(),
        editing: false,
        lastChanged: null,
        setupVersion: state.setupVersion + 1,
        ...classSetup(a.cls, "100", a.saved),
      };
    }
    case "applySaved": {
      if (!a.saved) return state;
      const setup = classSetup(state.cls, state.maths, a.saved);
      return {
        ...state,
        ...setup,
        marks: carryMarks(state, setup.subjects),
        overrides: { ...state.overrides, remarks: {} },
        setupVersion: state.setupVersion + 1,
      };
    }
    case "session":
      return {
        ...state,
        session: { ...state.session, [a.field]: a.value },
        monthTouched: state.monthTouched || a.field === "month",
      };
    case "student":
      return { ...state, student: { ...state.student, [a.field]: a.value } };
    case "mark":
      return {
        ...state,
        marks: { ...state.marks, [a.sid]: { ...state.marks[a.sid], [a.col]: a.value } },
        lastChanged: { sid: a.sid, col: a.col, n: (state.lastChanged?.n ?? 0) + 1 },
      };
    case "maths":
      return {
        ...state,
        maths: a.paper,
        subjects: state.subjects.map((s) => (s.maths ? { ...s, ...withMaths(s, a.paper) } : s)),
      };
    case "gradeRow":
      return { ...state, gradeRows: { ...state.gradeRows, [a.name]: a.value } };
    case "co":
      return { ...state, co: { ...state.co, [a.name]: a.value } };
    case "coAll":
      return { ...state, co: Object.fromEntries(a.names.map((n) => [n, a.value])) };
    case "override":
      return { ...state, overrides: { ...state.overrides, [a.field]: a.value } };
    case "remark": {
      const remarks = { ...state.overrides.remarks };
      if (a.value) remarks[a.sid] = a.value;
      else delete remarks[a.sid];
      return { ...state, overrides: { ...state.overrides, remarks } };
    }
    case "editing":
      return { ...state, editing: a.on };
    case "rename":
      return {
        ...state,
        formatTouched: true,
        subjects: state.subjects.map((s) => (s.id === a.sid ? { ...s, name: a.name, hi: hindiFor(state.cls, a.name) } : s)),
      };
    case "addSubject":
      return {
        ...state,
        formatTouched: true,
        subjects: [...state.subjects, { code: "", name: "NEW SUBJECT", hi: "नया विषय", id: addedId() }],
      };
    case "removeSubject": {
      const marks = { ...state.marks };
      delete marks[a.sid];
      return { ...state, formatTouched: true, marks, subjects: state.subjects.filter((s) => s.id !== a.sid) };
    }
    case "max":
      return { ...state, formatTouched: true, maxOv: { ...state.maxOv, [a.col]: a.value } };
    case "colLabel":
      return { ...state, formatTouched: true, colOv: { ...state.colOv, [a.col]: { ...state.colOv[a.col], label: a.label } } };
    case "colHidden":
      return { ...state, formatTouched: true, colOv: { ...state.colOv, [a.col]: { ...state.colOv[a.col], hidden: a.hidden } } };
    case "resetFormat": {
      const setup = classSetup(state.cls, state.maths, null);
      return {
        ...state,
        ...setup,
        marks: carryMarks(state, setup.subjects),
        overrides: { ...state.overrides, remarks: {} },
        setupVersion: state.setupVersion + 1,
      };
    }
    case "clearStudent":
      return {
        ...state,
        student: blankStudent(),
        marks: {},
        co: {},
        overrides: blankOverrides(),
        gradeRows: Object.fromEntries(Object.keys(state.gradeRows).map((k) => [k, ""])),
        // The Maths paper is chosen per student.
        maths: "100",
        subjects: state.subjects.map((s) => (s.maths ? { ...s, ...withMaths(s, "100") } : s)),
        editing: false,
        lastChanged: null,
      };
  }
}

export function isDirty(state: MarksheetState): boolean {
  const s = state.student;
  const studentTyped = (Object.keys(s) as (keyof Student)[]).some((k) => k !== "category" && k !== "medium" && s[k] !== "");
  const o = state.overrides;
  return (
    studentTyped ||
    Object.values(state.marks).some((m) => Object.values(m).some((v) => v !== "")) ||
    Object.values(state.co).some(Boolean) ||
    Object.values(state.gradeRows).some(Boolean) ||
    !!(o.result || o.grade || o.division || o.words || Object.keys(o.remarks).length) ||
    state.maths !== "100"
  );
}

export function useMarksheet() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const t = templateFor(state.cls);

  // The saved setup lives in this browser only, so it's read after the first render.
  useEffect(() => {
    dispatch({ type: "applySaved", saved: loadFormat(state.cls) });
    // Today's date is filled in here, not at build time, so it's always the real today.
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    dispatch({ type: "session", field: "publish", value: today });
    // Only on first load; class changes read the setup in setClass.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save the subject setup whenever a teacher edits it.
  useEffect(() => {
    if (!state.formatTouched) return;
    saveFormat(state.cls, {
      subjects: state.subjects.map((s) => ({ code: s.code, name: s.name, hi: s.hi, ...(s.maths ? { maths: true } : {}) })),
      maxOv: state.maxOv,
      colOv: state.colOv,
    });
  }, [state.cls, state.subjects, state.maxOv, state.colOv, state.formatTouched]);

  const columns = useMemo(() => visibleColumns(t, state.maxOv, state.colOv), [t, state.maxOv, state.colOv]);
  const everyColumn = useMemo(() => allColumns(t, state.maxOv, state.colOv), [t, state.maxOv, state.colOv]);
  const result = useMemo(
    () => calcResult(t, state.subjects, columns, state.marks, state.overrides),
    [t, state.subjects, columns, state.marks, state.overrides],
  );

  return {
    state,
    template: t,
    columns,
    everyColumn,
    result,
    customised: state.customised || state.formatTouched,
    dispatch,
    setClass: (cls: ClassKey) => dispatch({ type: "class", cls, saved: loadFormat(cls) }),
    resetSetup: () => {
      resetFormat(state.cls);
      dispatch({ type: "resetFormat" });
    },
  };
}

export type MarksheetApi = ReturnType<typeof useMarksheet>;
