import { describe, expect, test } from "vitest";
import { templateFor, nextClass } from "@/lib/templates";
import { formatPct, readMark, sanitizeMark } from "@/lib/rules/marks";
import { getDivision, getGrade } from "@/lib/rules/grades";
import { dobWords, totalToWords } from "@/lib/rules/words";
import { noOverrides, resultFor } from "./helpers";

// Reference: the school's real printed sheets. Columns in template order.

describe("Class 9 (board 75 + 25), school's real Class 9 sheet", () => {
  // aw, pw, q, hy for Hindi, English, Sanskrit, Maths, Science, Social Science
  const marks = [
    [74, 25, 74, 74],
    [73, 25, 74, 74],
    [74, 25, 73, 74],
    [70, 25, 72, 74],
    [71, 24, 73, 73],
    [73, 25, 72, 74],
  ];
  const r = resultFor("9", marks);

  test("every subject row matches the printed sheet", () => {
    const printed = r.rows.map((row) => [row.cells.aw, row.cells.pw, row.cells.q, row.cells.hy, row.thR, row.prR, row.total, row.remark]);
    expect(printed).toEqual([
      ["74", "22.5", "1.23", "1.23", 74, 25, 99, "DISTN"],
      ["73", "22.5", "1.23", "1.23", 73, 25, 98, "DISTN"],
      ["74", "22.5", "1.22", "1.23", 74, 25, 99, "DISTN"],
      ["70", "22.5", "1.20", "1.23", 70, 25, 95, "DISTN"],
      ["71", "21.6", "1.22", "1.22", 71, 24, 95, "DISTN"],
      ["73", "22.5", "1.20", "1.23", 73, 25, 98, "DISTN"],
    ]);
  });

  test("totals: 584 / 600, 97.3%, A+, First Division, PASS", () => {
    expect(r.total).toBe(584);
    expect(r.max).toBe(600);
    expect(formatPct(templateFor("9"), r.pct)).toBe("97.3");
    expect(r.grade).toBe("A+");
    expect(r.division).toBe("FIRST DIVISION");
    expect(r.result).toBe("PASS");
    expect(r.words).toBe("FIVE HUNDRED EIGHTY FOUR");
    expect(r.rows.reduce((a, x) => a + (x.thR ?? 0), 0)).toBe(435);
    expect(r.rows.reduce((a, x) => a + (x.prR ?? 0), 0)).toBe(149);
  });

  test("failing theory minimum (24/75) fails the student, whatever the total", () => {
    const fail = resultFor("9", [[24, 25, 75, 75], ...marks.slice(1)]);
    expect(fail.rows[0].pass).toBe(false);
    expect(fail.result).toBe("FAIL");
    expect(fail.division).toBe("FAIL");
    expect(fail.pct).toBeGreaterThan(60);
  });
});

describe("Nursery–8 (school exams rule)", () => {
  test("Class 6 matches the school's sheet: 574 / 600, 95.67%, A+, promoted to 7TH", () => {
    const r = resultFor("6", [
      [39, 60, 59, 40],
      [40, 58, 59, 36],
      [38, 60, 56, 40],
      [38, 59, 46, 40],
      [37, 54, 60, 40],
      [38, 58, 60, 38],
    ]);
    expect(r.rows.map((x) => [x.cells.mo, x.cells.hy, x.cells.wr, x.cells.pj, x.total])).toEqual([
      [10, 20, 59, 10, 99],
      [10, 19, 59, 9, 97],
      [10, 20, 56, 10, 96],
      [10, 20, 46, 10, 86],
      [9, 18, 60, 10, 97],
      [10, 19, 60, 10, 99],
    ]);
    const colSum = (k: string) => r.rows.reduce((a, x) => a + x.values[k].n, 0);
    const wSum = (k: string) => r.rows.reduce((a, x) => a + Number(x.cells[k]), 0);
    expect([colSum("mo"), colSum("hy"), colSum("wr"), colSum("pj")]).toEqual([230, 349, 340, 234]);
    expect([wSum("mo"), wSum("hy"), wSum("wr"), wSum("pj")]).toEqual([59, 116, 340, 59]);
    expect(r.total).toBe(574);
    expect(formatPct(templateFor("6"), r.pct)).toBe("95.67");
    expect(r.grade).toBe("A+");
    expect(r.result).toBe("PASS");
    expect(r.division).toBeNull();
    expect(r.rows.every((x) => x.remark === "")).toBe(true);
    expect(nextClass("6")).toBe("7TH");
  });

  test("Nursery matches the school's sheet: 246 / 300, 82.00%, A, promoted to LKG", () => {
    const r = resultFor("N", [
      [28, 51, 53, 35],
      [28, 42, 50, 34],
      [28, 48, 48, 35],
    ]);
    expect(r.rows.map((x) => x.total)).toEqual([86, 80, 80]);
    expect(r.rows.map((x) => x.cells.mo)).toEqual([7, 7, 7]);
    expect(r.total).toBe(246);
    expect(r.max).toBe(300);
    expect(formatPct(templateFor("N"), r.pct)).toBe("82.00");
    expect(r.grade).toBe("A");
    expect(nextClass("N")).toBe("LKG");
  });

  test("Class 1 uses the same rule and counts EVS and GK (school's spreadsheet error not copied)", () => {
    const r = resultFor("1", [
      [36, 50, 40, 40],
      [32, 51, 42, 36],
      [32, 43, 38, 32],
      [35, 55, 55, 36],
      [34, 50, 42, 34],
    ]);
    expect(r.rows).toHaveLength(5);
    expect(r.max).toBe(500);
    expect(r.rows.map((x) => x.total)).toEqual([76, 76, 68, 91, 77]);
    expect(r.total).toBe(388);
  });

  test("a subject below 33 fails the student", () => {
    const r = resultFor("6", [[10, 10, 10, 10], [40, 60, 60, 40], [40, 60, 60, 40], [40, 60, 60, 40], [40, 60, 60, 40], [40, 60, 60, 40]]);
    // 10/40→2.5→3, 10/60×20→3.33→3, 10/60×60→10, 10/40→2.5→3 (halves round up, as on the school's sheets)
    expect(r.rows[0].total).toBe(19);
    expect(r.result).toBe("FAIL");
    expect(r.passed).toBe(false);
  });

  test("a hidden column counts as 0 (best total becomes 90)", () => {
    const r = resultFor("7", [[40, 60, 60]], { colOv: { pj: { hidden: true } } });
    expect(r.rows[0].columns.map((c) => c.key)).toEqual(["mo", "hy", "wr"]);
    expect(r.rows[0].total).toBe(90);
  });

  test("an edited maximum is respected", () => {
    const r = resultFor("7", [[50, 60, 60, 40]], { maxOv: { mo: 50 } });
    expect(r.rows[0].cells.mo).toBe(10);
    expect(r.rows[0].total).toBe(100);
  });
});

describe("marks entry", () => {
  test("AB counts as 0 but is marked absent", () => {
    expect(readMark("AB")).toEqual({ ab: true, n: 0 });
    const r = resultFor("6", [[40, "AB", 60, 40]]);
    expect(r.rows[0].values.hy.ab).toBe(true);
    expect(r.rows[0].total).toBe(80);
  });

  test("a blank box counts 0 and is counted as blank", () => {
    const r = resultFor("6", [[40, "", 60, 40]]);
    expect(r.rows[0].blanks).toBe(1);
    expect(r.rows[0].total).toBe(80);
  });

  test("a mark above the maximum gives no total", () => {
    const r = resultFor("9", [[80, 25, 75, 75]]);
    expect(r.rows[0].invalid.map((c) => c.key)).toEqual(["aw"]);
    expect(r.rows[0].total).toBeNull();
    expect(r.anyInvalid).toBe(true);
  });

  test("sanitizeMark keeps numbers and AB only", () => {
    expect(sanitizeMark("7a5")).toBe("75");
    expect(sanitizeMark("ab")).toBe("AB");
    expect(sanitizeMark("a")).toBe("A");
    expect(sanitizeMark("22.555")).toBe("22.55");
    expect(sanitizeMark("1.2.3")).toBe("1.23");
    expect(sanitizeMark("-5")).toBe("5");
  });
});

describe("overrides", () => {
  test("a manual PASS also gives the division from the percentage (grace marks)", () => {
    const o = noOverrides();
    o.result = "PASS";
    const r = resultFor("9", [[24, 25, 75, 75], [74, 25, 74, 74], [73, 25, 74, 74], [74, 25, 73, 74], [70, 25, 72, 74], [71, 24, 73, 73]]);
    expect(r.division).toBe("FAIL");
    const graced = resultFor("9", [[24, 25, 75, 75], [74, 25, 74, 74], [73, 25, 74, 74], [74, 25, 73, 74], [70, 25, 72, 74], [71, 24, 73, 73]], { overrides: o });
    expect(graced.result).toBe("PASS");
    expect(graced.division).toBe("FIRST DIVISION");
  });

  test("manual result, grade and remark override the automatic ones", () => {
    const o = noOverrides();
    o.result = "PASS";
    o.grade = "B";
    o.remarks = { s0: "GRACE" };
    const r = resultFor("9", [[20, 25, 75, 75]], { overrides: o });
    expect(r.result).toBe("PASS");
    expect(r.passed).toBe(true);
    expect(r.grade).toBe("B");
    expect(r.rows[0].remark).toBe("GRACE");
  });
});

describe("grades, divisions and words", () => {
  test("grade boundaries (below 33 is E)", () => {
    expect([85, 84.9, 76, 66, 56, 51, 46, 33, 32.9].map(getGrade)).toEqual(["A+", "A", "A", "B+", "B", "C+", "C", "D", "E"]);
  });
  test("division boundaries", () => {
    expect([60, 59.9, 45, 33, 32.9].map(getDivision)).toEqual(["FIRST DIVISION", "SECOND DIVISION", "SECOND DIVISION", "THIRD DIVISION", "FAIL"]);
  });
  test("total and date of birth in words", () => {
    expect(totalToWords(246)).toBe("TWO HUNDRED FORTY SIX");
    expect(totalToWords(1000)).toBe("ONE THOUSAND");
    expect(dobWords("2013-10-19")).toBe("NINETEENTH OCTOBER TWO THOUSAND THIRTEEN");
    expect(dobWords("2022-11-07")).toBe("SEVENTH NOVEMBER TWO THOUSAND TWENTY TWO");
    expect(dobWords("2021-01-21")).toBe("TWENTY FIRST JANUARY TWO THOUSAND TWENTY ONE");
  });
});
