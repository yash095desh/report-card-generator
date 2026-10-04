import { describe, expect, test } from "vitest";
import { CLASS_ORDER, TEMPLATES, className, classLabel, templateFor, validateTemplate } from "@/lib/templates";
import { buildChecklist } from "@/lib/rules/checklist";
import { calcResult, visibleColumns } from "@/lib/rules/marks";
import type { Session, Student } from "@/lib/types";
import { noOverrides, subjectsFor } from "./helpers";

describe("templates", () => {
  test("every template is valid", () => {
    for (const t of TEMPLATES) expect(validateTemplate(t)).toEqual([]);
  });

  test("every class Nursery–10 has exactly one template with subjects", () => {
    for (const cls of CLASS_ORDER) {
      const t = templateFor(cls);
      expect(t.subjects(cls).length).toBeGreaterThan(0);
      expect(TEMPLATES.filter((x) => x.classes.includes(cls))).toHaveLength(1);
    }
    expect(CLASS_ORDER).not.toContain("11");
  });

  test("subjects per stage match the school's sheets", () => {
    expect(templateFor("N").subjects("N").map((s) => s.name)).toEqual(["ENGLISH", "HINDI", "MATHEMATICS"]);
    expect(templateFor("1").subjects("1").map((s) => s.name)).toEqual(["ENGLISH", "HINDI", "MATHEMATICS", "EVS", "GENERAL KNOWLEDGE"]);
    expect(templateFor("6").subjects("6")).toHaveLength(6);
    expect(templateFor("9").subjects("9").map((s) => s.code)).toEqual(["401", "411", "512", "100", "200", "300"]);
    expect(templateFor("N").gradeRows("N").map((g) => g.en)).toEqual(["DRAWING / PAINTING"]);
    expect(templateFor("6").gradeRows("6")).toEqual([]);
  });

  test("class names and labels", () => {
    expect(className("N")).toBe("Nursery");
    expect(className("7")).toBe("Class 7");
    expect(classLabel("N")).toBe("NURSERY");
  });

  test("9–10 columns can't be changed by teachers", () => {
    const t = templateFor("9");
    expect(visibleColumns(t, { aw: 100 }, { q: { hidden: true } }).map((c) => [c.key, c.max])).toEqual([
      ["aw", 75], ["pw", 25], ["q", 75], ["hy", 75],
    ]);
  });
});

describe("before-you-print checklist", () => {
  const student: Student = {
    fullName: "", fatherName: "", motherName: "", dob: "", category: "General", roll: "", enrolment: "",
    scholar: "", samagra: "", medium: "English", photo: "", attPresent: "", attTotal: "",
  };
  const session: Session = { year: "2025-26", month: "MARCH", examYear: "2026", teacher: "", incharge: "", principal: "", publish: "" };

  test("lists errors and warnings", () => {
    const t = templateFor("7");
    const subjects = subjectsFor("7");
    const result = calcResult(t, subjects, visibleColumns(t, {}, {}), { [subjects[0].id]: { mo: "99" } }, noOverrides());
    const issues = buildChecklist({ template: t, cls: "7", student, session, result, gradeRows: {}, co: {} });
    expect(issues.filter((i) => i.level === "err")).toHaveLength(1);
    const text = issues.map((i) => i.message).join(" | ");
    expect(text).toContain("English: Monthly is above the maximum of 40.");
    expect(text).toContain("Student's name is empty.");
    expect(text).toContain("15 co-scholastic grades are not chosen.");
    expect(text).not.toContain("sample");
  });
});
