"use client";

import type { Result } from "@/lib/rules/marks";
import { formatPct } from "@/lib/rules/marks";
import type { Template } from "@/lib/types";

/** The live total / percent / grade / result line pinned under the form. */
export function ResultStrip({ t, result }: { t: Template; result: Result }) {
  if (!result.anyEntered) {
    return (
      <div className="strip" aria-live="polite">
        <div>
          <span className="k">TOTAL</span>
          <span className="v">
            – <small>/ {result.max}</small>
          </span>
        </div>
        <div>
          <span className="k">RESULT</span>
          <span className="v" style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-3)" }}>
            Appears as you type marks
          </span>
        </div>
      </div>
    );
  }
  if (result.anyInvalid) {
    return (
      <div className="strip" aria-live="polite">
        <div>
          <span className="k">TOTAL</span>
          <span className="v">
            – <small>/ {result.max}</small>
          </span>
        </div>
        <span className="res fail">Fix marks above maximum</span>
      </div>
    );
  }
  return (
    <div className="strip" aria-live="polite">
      <div>
        <span className="k">TOTAL</span>
        <span className="v">
          {result.total} <small>/ {result.max}</small>
        </span>
      </div>
      <div>
        <span className="k">PERCENT</span>
        <span className="v">{formatPct(t, result.pct)}%</span>
      </div>
      <div>
        <span className="k">GRADE</span>
        <span className="v">{result.grade}</span>
      </div>
      {t.division && result.division && (
        <div>
          <span className="k">DIVISION</span>
          <span className="v" style={{ fontSize: 14 }}>
            {result.division.replace(" DIVISION", "")}
          </span>
        </div>
      )}
      <span className={`res ${result.passed ? "pass" : "fail"}`}>{result.result}</span>
    </div>
  );
}
