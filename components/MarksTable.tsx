"use client";

import { Student, SubjectMarks } from "@/types";
import { schoolConfig } from "@/config/schoolConfig";
import { calculateSubjectRow } from "@/lib/calculations";

interface MarksTableProps {
  student: Student;
  onChange: (student: Student) => void;
}

export function MarksTable({ student, onChange }: MarksTableProps) {
  const handleMarkChange = (
    subjectCode: string,
    field: keyof SubjectMarks,
    value: string
  ) => {
    const numValue = value === "" ? "" : Number(value);
    const maxValue = field === "projectWork" ? 25 : 75;

    if (numValue !== "" && (numValue < 0 || numValue > maxValue)) return;

    onChange({
      ...student,
      marks: {
        ...student.marks,
        [subjectCode]: {
          ...student.marks[subjectCode],
          [field]: numValue,
        },
      },
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="border p-1.5 text-left font-medium w-28">Subject</th>
            <th className="border p-1.5 text-center font-medium">
              Annual Theory (/75)
            </th>
            <th className="border p-1.5 text-center font-medium">
              Project Work (/25)
            </th>
            <th className="border p-1.5 text-center font-medium">
              Quarterly (/75)
            </th>
            <th className="border p-1.5 text-center font-medium">
              Half Yearly (/75)
            </th>
            <th className="border p-1.5 text-center font-medium w-10">
              TH
            </th>
            <th className="border p-1.5 text-center font-medium w-10">
              PR
            </th>
            <th className="border p-1.5 text-center font-medium w-14">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {schoolConfig.subjects.map((subject) => {
            const marks = student.marks[subject.code] || {
              monthlyTest: "",
              halfYearly: "",
              annualWritten: "",
              projectWork: "",
            };
            const calc = calculateSubjectRow(marks);

            return (
              <tr key={subject.code} className="hover:bg-muted/20">
                <td className="border p-1.5 text-xs font-medium">
                  ({subject.code}) {subject.name}
                </td>
                {/* Annual Theory /75 */}
                <td className="border p-0.5">
                  <input
                    type="number"
                    min={0}
                    max={75}
                    value={marks.annualWritten}
                    onChange={(e) =>
                      handleMarkChange(subject.code, "annualWritten", e.target.value)
                    }
                    className="w-12 h-7 text-center text-xs border rounded px-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="0"
                  />
                </td>
                {/* Project Work /25 */}
                <td className="border p-0.5">
                  <input
                    type="number"
                    min={0}
                    max={25}
                    value={marks.projectWork}
                    onChange={(e) =>
                      handleMarkChange(subject.code, "projectWork", e.target.value)
                    }
                    className="w-12 h-7 text-center text-xs border rounded px-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="0"
                  />
                </td>
                {/* Quarterly /75 (for 5% quarterly weightage) */}
                <td className="border p-0.5">
                  <input
                    type="number"
                    min={0}
                    max={75}
                    value={marks.monthlyTest}
                    onChange={(e) =>
                      handleMarkChange(subject.code, "monthlyTest", e.target.value)
                    }
                    className="w-12 h-7 text-center text-xs border rounded px-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="0"
                  />
                </td>
                {/* Half Yearly /75 (for 5% HY weightage) */}
                <td className="border p-0.5">
                  <input
                    type="number"
                    min={0}
                    max={75}
                    value={marks.halfYearly}
                    onChange={(e) =>
                      handleMarkChange(subject.code, "halfYearly", e.target.value)
                    }
                    className="w-12 h-7 text-center text-xs border rounded px-1 bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="0"
                  />
                </td>
                {/* TH (round) */}
                <td className="border p-1 text-center text-xs font-semibold">
                  {calc.theoryRound || ""}
                </td>
                {/* PR (round) */}
                <td className="border p-1 text-center text-xs font-semibold">
                  {calc.practicalRound || ""}
                </td>
                {/* Grand Total */}
                <td className="border p-1 text-center text-xs font-bold">
                  {calc.grandTotal || ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
