import { beforeEach, describe, expect, test } from "vitest";
import { keyFor, loadFormat, resetFormat, saveFormat } from "@/lib/format-store";

describe("saved subject setup", () => {
  beforeEach(() => localStorage.clear());

  test("saves, loads and resets per class", () => {
    expect(loadFormat("7")).toBeNull();
    saveFormat("7", { subjects: [{ code: "", name: "COMPUTER", hi: "COMPUTER" }], maxOv: { mo: 50 }, colOv: { pj: { hidden: true } } });
    expect(loadFormat("7")?.subjects[0].name).toBe("COMPUTER");
    expect(loadFormat("7")?.colOv.pj.hidden).toBe(true);
    expect(loadFormat("7")?.maxOv.mo).toBe(50);
    expect(loadFormat("6")).toBeNull();
    resetFormat("7");
    expect(loadFormat("7")).toBeNull();
  });

  test("ignores broken or damaged saved data", () => {
    localStorage.setItem(keyFor("7"), "{not json");
    expect(loadFormat("7")).toBeNull();
    localStorage.setItem(keyFor("7"), JSON.stringify({ maxOv: {} }));
    expect(loadFormat("7")).toBeNull();
    localStorage.setItem(keyFor("7"), JSON.stringify({ subjects: [] }));
    expect(loadFormat("7")).toBeNull();
    localStorage.setItem(keyFor("7"), JSON.stringify({ subjects: [{ code: "" }, { name: "HINDI" }], maxOv: { mo: "x", hy: 0, wr: 70 } }));
    const f = loadFormat("7");
    expect(f?.subjects.map((s) => s.name)).toEqual(["HINDI"]);
    expect(f?.maxOv).toEqual({ wr: 70 });
  });

  test("an old setup stops applying when the class's template changes", () => {
    localStorage.setItem("rc-v2-format:7", JSON.stringify({ subjects: [{ code: "", name: "OLD", hi: "OLD" }], maxOv: {}, colOv: {} }));
    expect(loadFormat("7")).toBeNull();
    expect(keyFor("7")).toMatch(/^rc-v2-format:7:[a-z0-9]+$/);
    expect(keyFor("7")).not.toBe(keyFor("6"));
  });

  test("never stores student details", () => {
    saveFormat("7", { subjects: [{ code: "", name: "HINDI", hi: "हिन्दी" }], maxOv: {}, colOv: {} });
    expect(Object.keys(JSON.parse(localStorage.getItem(keyFor("7"))!))).toEqual(["subjects", "maxOv", "colOv"]);
  });

  test("works without storage", () => {
    expect(loadFormat("7", null)).toBeNull();
    expect(() => saveFormat("7", { subjects: [], maxOv: {}, colOv: {} }, null)).not.toThrow();
  });
});
