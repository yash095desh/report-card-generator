"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A small panel anchored under a control (the "Clear this student?" confirm and the
 * "Before you print" list). Closes on Escape or a click outside, and returns focus to the anchor.
 */
export function Popover({ anchor, onClose, children, label }: { anchor: HTMLElement; onClose: () => void; children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // Only ever opened by a click, so the anchor is on screen and can be measured once.
  const [pos] = useState(() => {
    const r = anchor.getBoundingClientRect();
    return { top: r.bottom + 8 + window.scrollY, left: Math.max(12, Math.min(r.right - 360, window.innerWidth - 372)) };
  });

  useEffect(() => {
    const first = ref.current?.querySelector<HTMLElement>("[data-focus]") ?? ref.current?.querySelector("button");
    first?.focus();
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!ref.current?.contains(target) && !anchor.contains(target)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        anchor.focus();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchor, onClose]);

  return (
    <div ref={ref} className="pop open" role="dialog" aria-label={label} style={{ top: pos.top, left: pos.left }}>
      {children}
    </div>
  );
}
