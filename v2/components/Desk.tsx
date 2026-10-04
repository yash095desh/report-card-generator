"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import type { MarksheetApi } from "@/hooks/useMarksheet";
import { Marksheet } from "@/components/sheet/Marksheet";
import { Icon } from "@/components/Icon";

/** The grey desk with the A4 sheet scaled to fit its width, plus the over-max warning. */
export function Desk({ api, onOverflowChange }: { api: MarksheetApi; onOverflowChange: (overflow: boolean) => void }) {
  const { state, result, columns } = api;
  const deskRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  // Scale the paper down to the desk's width (never up), and size its wrapper to match.
  useLayoutEffect(() => {
    const desk = deskRef.current;
    const wrap = wrapRef.current;
    const paper = paperRef.current;
    if (!desk || !wrap || !paper) return;
    const fit = () => {
      const scale = Math.min(1, (desk.clientWidth - 64) / paper.offsetWidth);
      paper.style.transform = `scale(${scale})`;
      wrap.style.width = `${paper.offsetWidth * scale}px`;
      wrap.style.height = `${paper.offsetHeight * scale}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(desk);
    ro.observe(paper);
    return () => ro.disconnect();
  }, []);

  // Briefly highlight the sheet cell (and totals) for the mark just typed.
  const changed = state.lastChanged;
  useEffect(() => {
    if (!changed || !paperRef.current) return;
    const cells = paperRef.current.querySelectorAll<HTMLElement>(
      `[data-c="${changed.sid}:${changed.col}"], [data-c="${changed.sid}:total"], [data-c="total"]`,
    );
    cells.forEach((el) => {
      el.classList.remove("pulse");
      void el.offsetWidth; // restart the animation
      el.classList.add("pulse");
    });
  }, [changed]);

  return (
    <main className="desk" ref={deskRef}>
      {result.anyInvalid && (
        <div className="sheet-warn">
          <Icon name="alert" />
          Some marks are above the maximum. The totals will show once they are fixed.
        </div>
      )}
      <div className="paper-wrap" ref={wrapRef}>
        <div className="paper" ref={paperRef}>
          <Marksheet
            cls={state.cls}
            student={state.student}
            session={state.session}
            result={result}
            columns={columns}
            marks={state.marks}
            gradeRows={state.gradeRows}
            co={state.co}
            onOverflowChange={onOverflowChange}
          />
        </div>
      </div>
    </main>
  );
}
