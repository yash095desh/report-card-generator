"use client";

import { useId, type ChangeEvent, type ReactNode } from "react";

/** Upper-cases while typing without the caret jumping to the end. */
export function upperChange(e: ChangeEvent<HTMLInputElement>, set: (v: string) => void) {
  const el = e.target;
  const pos = el.selectionStart;
  set(el.value.toUpperCase());
  requestAnimationFrame(() => {
    if (pos != null && document.activeElement === el) el.setSelectionRange(pos, pos);
  });
}

interface TextFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "date";
  placeholder?: string;
  upper?: boolean;
  full?: boolean;
  inputMode?: "numeric" | "text";
}

export function TextField({ label, hint, value, onChange, type = "text", placeholder, upper, full, inputMode }: TextFieldProps) {
  const id = useId();
  return (
    <div className={full ? "f full" : "f"}>
      <label htmlFor={id}>
        {label}
        {hint && <span className="hint"> {hint}</span>}
      </label>
      <input
        id={id}
        className="field"
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        inputMode={inputMode}
        onChange={(e) => (upper ? upperChange(e, onChange) : onChange(e.target.value))}
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | [string, string])[];
  full?: boolean;
}

export function SelectField({ label, value, onChange, options, full }: SelectFieldProps) {
  const id = useId();
  return (
    <div className={full ? "f full" : "f"}>
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const [v, l] = Array.isArray(o) ? o : [o, o];
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
    </div>
  );
}

/** Two-or-more-choice toggle (Medium, Maths paper). */
export function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, ReactNode][]; onChange: (v: T) => void }) {
  return (
    <div className="f">
      <span className="flabel">{label}</span>
      <div className="seg" role="group" aria-label={label}>
        {options.map(([v, text]) => (
          <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
