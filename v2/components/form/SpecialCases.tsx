"use client";

import type { MarksheetApi } from "@/hooks/useMarksheet";
import { GRADES } from "@/lib/rules/grades";
import { titleCase } from "@/lib/text";
import { Icon } from "@/components/Icon";
import { SelectField, TextField, upperChange } from "./fields";

/** Manual overrides for grace marks, re-checks and other exceptions. */
export function SpecialCases({ api }: { api: MarksheetApi }) {
  const { state, template: t, dispatch } = api;
  const o = state.overrides;
  const set = (field: "result" | "grade" | "division" | "words") => (value: string) => dispatch({ type: "override", field, value });
  return (
    <section className="group">
      <details className="special">
        <summary>
          Special cases
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--ink-3)" }}>
            Optional <Icon name="chevron" />
          </span>
        </summary>
        <p className="gsub">Only for grace marks, re-checks or other exceptions. Leave on Automatic otherwise.</p>
        <div className="grid">
          <SelectField label="Result" value={o.result} onChange={set("result")} options={[["", "Automatic"], t.words.pass, t.words.fail]} />
          <SelectField label="Grade" value={o.grade} onChange={set("grade")} options={[["", "Automatic"], ...GRADES]} />
          {t.division && (
            <SelectField
              label="Division"
              value={o.division}
              onChange={set("division")}
              options={[["", "Automatic"], "FIRST DIVISION", "SECOND DIVISION", "THIRD DIVISION", "FAIL"]}
            />
          )}
          <TextField label="Total marks in words" value={o.words} onChange={set("words")} placeholder="Automatic" upper full />
        </div>
        {t.distn && (
          <>
            <p className="subhead">Remarks per subject</p>
            <div className="remarklist">
              {state.subjects.map((s) => (
                <div className="grow" key={s.id}>
                  <span>{titleCase(s.name)}</span>
                  <input
                    className="field"
                    value={o.remarks[s.id] ?? ""}
                    placeholder="Automatic"
                    aria-label={`Remark for ${s.name}`}
                    onChange={(e) => upperChange(e, (value) => dispatch({ type: "remark", sid: s.id, value }))}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </details>
    </section>
  );
}
