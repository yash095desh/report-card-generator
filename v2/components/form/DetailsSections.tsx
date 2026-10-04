"use client";
/* eslint-disable @next/next/no-img-element -- local photo preview from a data URL */

import { useId } from "react";
import type { Session, Student } from "@/lib/types";
import { MONTHS } from "@/lib/rules/words";
import type { MarksheetApi } from "@/hooks/useMarksheet";
import { Icon } from "@/components/Icon";
import { Segmented, SelectField, TextField } from "./fields";

export function SessionSection({ api }: { api: MarksheetApi }) {
  const { state, template: t, dispatch } = api;
  const ss = state.session;
  const set = (field: keyof Session) => (value: string) => dispatch({ type: "session", field, value });
  const monthId = useId();
  return (
    <section className="group">
      <div className="ghead">
        <h2>Session</h2>
      </div>
      <p className="gsub">Filled once per sitting. These stay when you clear for the next student.</p>
      <div className="grid">
        <TextField label="Academic year" value={ss.year} onChange={set("year")} placeholder="2025-26" />
        <div className="f">
          <label htmlFor={monthId}>Exam month &amp; year</label>
          <div className="pair">
            <select id={monthId} value={ss.month} onChange={(e) => set("month")(e.target.value)}>
              {MONTHS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <input
              className="field"
              style={{ width: 84, flex: "none" }}
              value={ss.examYear}
              inputMode="numeric"
              aria-label="Exam year"
              onChange={(e) => set("examYear")(e.target.value.replace(/\D/g, "").slice(0, 4))}
            />
          </div>
        </div>
        <TextField label="Class teacher" value={ss.teacher} onChange={set("teacher")} placeholder="Teacher's full name" upper />
        {t.examIncharge && <TextField label="Exam in-charge" value={ss.incharge} onChange={set("incharge")} upper />}
        <TextField label="Principal" value={ss.principal} onChange={set("principal")} upper />
        <TextField label="Publish date" hint="(result date)" type="date" value={ss.publish} onChange={set("publish")} />
      </div>
    </section>
  );
}

export function StudentSection({ api }: { api: MarksheetApi }) {
  const { state, template: t, dispatch } = api;
  const s = state.student;
  const set = (field: keyof Student) => (value: string) => dispatch({ type: "student", field, value });
  return (
    <section className="group">
      <div className="ghead">
        <h2>Student</h2>
      </div>
      <p className="gsub">Copy these exactly as they should appear on the marksheet.</p>
      <div className="grid">
        <TextField label="Student's full name" value={s.fullName} onChange={set("fullName")} upper full />
        <TextField label="Father's name" value={s.fatherName} onChange={set("fatherName")} upper />
        <TextField label="Mother's name" value={s.motherName} onChange={set("motherName")} upper />
        <TextField label="Date of birth" type="date" value={s.dob} onChange={set("dob")} />
        {t.showCategory && (
          <SelectField label="Category" value={s.category} onChange={set("category")} options={["General", "OBC", "OBC-A", "OBC-B", "SC", "ST"]} />
        )}
        <TextField label="Roll no." value={s.roll} onChange={set("roll")} upper />
        <TextField label="Scholar no." value={s.scholar} onChange={set("scholar")} upper />
        {t.showEnrolment && <TextField label="Enrolment no." value={s.enrolment} onChange={set("enrolment")} upper />}
        <TextField label="Samagra ID" hint="(SSSMID)" value={s.samagra} onChange={set("samagra")} inputMode="numeric" />
        <Segmented label="Medium" value={s.medium} options={[["English", "English"], ["Hindi", "Hindi"]]} onChange={set("medium")} />
        <Attendance s={s} set={set} />
        <Photo photo={s.photo} set={set("photo")} />
      </div>
    </section>
  );
}

function Attendance({ s, set }: { s: Student; set: (f: keyof Student) => (v: string) => void }) {
  const id = useId();
  const digits = (v: string) => v.replace(/\D/g, "").slice(0, 3);
  return (
    <div className="f">
      <label htmlFor={id}>
        Attendance <span className="hint">(optional)</span>
      </label>
      <div className="pair">
        <input id={id} className="field" value={s.attPresent} inputMode="numeric" placeholder="Present" onChange={(e) => set("attPresent")(digits(e.target.value))} />
        <span className="sep">of</span>
        <input className="field" value={s.attTotal} inputMode="numeric" placeholder="Total days" aria-label="Total working days" onChange={(e) => set("attTotal")(digits(e.target.value))} />
      </div>
    </div>
  );
}

function Photo({ photo, set }: { photo: string; set: (v: string) => void }) {
  const id = useId();
  const onFile = (file: File | undefined) => {
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => set(String(fr.result));
    fr.readAsDataURL(file);
  };
  return (
    <div className="f full">
      <span className="flabel">
        Photo <span className="hint">(optional)</span>
      </span>
      <div className="photo">
        <div className="thumb">{photo ? <img src={photo} alt="" /> : <Icon name="image" />}</div>
        <label className="btn sm" htmlFor={id}>
          {photo ? "Change photo" : "Add photo"}
        </label>
        {photo ? (
          <button type="button" className="linkbtn" onClick={() => set("")}>
            Remove
          </button>
        ) : (
          <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Leave empty to paste a printed photo later.</span>
        )}
        <input
          id={id}
          type="file"
          accept="image/*"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = ""; // lets the same photo be chosen again after Remove
          }}
        />
      </div>
    </div>
  );
}
