"use client";

import { useState } from "react";
import { useStudents } from "@/hooks/useStudents";
import { StudentList } from "@/components/StudentList";
import { StudentForm } from "@/components/StudentForm";
import { ResultCard } from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export default function Home() {
  const {
    students,
    selectedId,
    currentStudent,
    setCurrentStudent,
    isEditing,
    selectStudent,
    addStudent,
    updateStudent,
    deleteStudent,
    newStudent,
  } = useStudents();

  const [printMode, setPrintMode] = useState<"current" | "all" | null>(null);

  const handleExport = (mode: "current" | "all") => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 300);
  };

  return (
    <>
      <div className="flex h-screen bg-zinc-100 print:hidden">
        {/* Left Panel */}
        <div className="w-[480px] shrink-0 border-r bg-white flex flex-col overflow-hidden">
          <StudentList
            students={students}
            selectedId={selectedId}
            onSelect={selectStudent}
            onDelete={deleteStudent}
            onNew={newStudent}
          />
          <div className="flex-1 overflow-y-auto">
            <StudentForm
              student={currentStudent}
              onChange={setCurrentStudent}
              onSave={addStudent}
              onUpdate={updateStudent}
              isEditing={isEditing}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Export buttons */}
          <div className="flex items-center justify-end gap-2 px-8 py-3 bg-zinc-50 border-b shrink-0">
            {currentStudent.fullName && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport("current")}
                className="gap-1.5"
              >
                <FileDown className="w-4 h-4" />
                Export Current
              </Button>
            )}
            {students.length > 0 && (
              <Button
                size="sm"
                onClick={() => handleExport("all")}
                className="gap-1.5"
              >
                <FileDown className="w-4 h-4" />
                Export All ({students.length})
              </Button>
            )}
          </div>

          {/* Preview area */}
          <div className="flex-1 overflow-y-auto p-8 flex justify-center">
            <div className="w-[210mm] min-h-[297mm] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] rounded-sm p-8">
              {currentStudent.fullName ? (
                <ResultCard student={currentStudent} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">
                    Fill in student details on the left to see the live preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== PRINT-ONLY: Hidden on screen, visible when printing ===== */}
      <div className="hidden print:block">
        {printMode === "current" && currentStudent.fullName && (
          <div className="print-card">
            <ResultCard student={currentStudent} />
          </div>
        )}

        {printMode === "all" &&
          students.map((student) => (
            <div key={student.id} className="print-card">
              <ResultCard student={student} />
            </div>
          ))}
      </div>
    </>
  );
}
