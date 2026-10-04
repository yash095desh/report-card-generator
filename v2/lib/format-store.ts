import type { ClassKey, Format } from "@/lib/types";
import { templateFor } from "@/lib/templates";

/**
 * Each class's subject setup (subjects, column names, hidden columns, maximum marks) is kept
 * in this browser so teachers set it up once. Student details and marks are never stored.
 *
 * The key includes a fingerprint of the class's default subjects and columns. When a template
 * changes (e.g. the school confirms a subject list), older saved setups for that class stop
 * applying instead of hiding the new defaults forever.
 */
export function keyFor(cls: ClassKey): string {
  const t = templateFor(cls);
  const basis = JSON.stringify([t.subjects(cls).map((s) => s.name), t.columns.map((c) => [c.key, c.max, c.weight ?? 0])]);
  let h = 0;
  for (let i = 0; i < basis.length; i++) h = (Math.imul(31, h) + basis.charCodeAt(i)) | 0;
  return `rc-v2-format:${cls}:${(h >>> 0).toString(36)}`;
}

const isText = (v: unknown): v is string => typeof v === "string";

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function loadFormat(cls: ClassKey, store: Storage | null = storage()): Format | null {
  try {
    const raw = store?.getItem(keyFor(cls));
    if (!raw) return null;
    const f = JSON.parse(raw) as Partial<Format>;
    if (!Array.isArray(f.subjects)) return null;
    // Keep only well-formed entries; a damaged setup must never stop the page from opening.
    const subjects = f.subjects
      .filter((s) => s && isText(s.name) && s.name.trim())
      .map((s) => ({ code: isText(s.code) ? s.code : "", name: s.name, hi: isText(s.hi) ? s.hi : s.name, ...(s.maths ? { maths: true } : {}) }));
    if (!subjects.length) return null;
    const maxOv = Object.fromEntries(Object.entries(f.maxOv ?? {}).filter(([, v]) => Number.isInteger(v) && v > 0));
    const colOv = typeof f.colOv === "object" && f.colOv ? f.colOv : {};
    return { subjects, maxOv, colOv };
  } catch {
    return null;
  }
}

export function saveFormat(cls: ClassKey, format: Format, store: Storage | null = storage()): void {
  try {
    store?.setItem(keyFor(cls), JSON.stringify(format));
  } catch {
    // Storage full or blocked: the setup still works for this sitting.
  }
}

export function resetFormat(cls: ClassKey, store: Storage | null = storage()): void {
  try {
    store?.removeItem(keyFor(cls));
  } catch {
    // ignore
  }
}
