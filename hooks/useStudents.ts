import { useState, useCallback } from "react";
import { Student, SubjectMarks, Medium } from "@/types";
import { schoolConfig } from "@/config/schoolConfig";

function createEmptyMarks(): Record<string, SubjectMarks> {
  const marks: Record<string, SubjectMarks> = {};
  for (const subject of schoolConfig.subjects) {
    marks[subject.code] = {
      monthlyTest: "",
      halfYearly: "",
      annualWritten: "",
      projectWork: "",
    };
  }
  return marks;
}

export function createEmptyStudent(): Student {
  return {
    id: crypto.randomUUID(),
    fullName: "",
    fatherName: "",
    motherName: "",
    dateOfBirth: "",
    category: "General",
    rollNumber: "",
    scholarNumber: "",
    enrolmentNumber: "",
    samagraId: "",
    aadhaarNumber: "",
    medium: "Hindi" as Medium,
    mathVariant: "basic",
    photo: "",
    attendancePresent: "",
    attendanceTotal: "",
    remarks: "",
    publishDate: new Date().toISOString().split("T")[0],
    marks: createEmptyMarks(),
    overrides: {
      envEducationGrade: "A+",
    },
    classTeacherName: "",
    examInchargeName: "",
    principalName: "",
  };
}

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student>(createEmptyStudent());
  const [isEditing, setIsEditing] = useState(false);

  const selectStudent = useCallback((id: string) => {
    const student = students.find((s) => s.id === id);
    if (student) {
      setCurrentStudent({ ...student });
      setSelectedId(id);
      setIsEditing(true);
    }
  }, [students]);

  const addStudent = useCallback(() => {
    setStudents((prev) => [...prev, { ...currentStudent }]);
    setSelectedId(currentStudent.id);
    setIsEditing(true);
  }, [currentStudent]);

  const updateStudent = useCallback(() => {
    setStudents((prev) =>
      prev.map((s) => (s.id === currentStudent.id ? { ...currentStudent } : s))
    );
  }, [currentStudent]);

  const deleteStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setCurrentStudent(createEmptyStudent());
      setIsEditing(false);
    }
  }, [selectedId]);

  const newStudent = useCallback(() => {
    setCurrentStudent(createEmptyStudent());
    setSelectedId(null);
    setIsEditing(false);
  }, []);

  return {
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
  };
}
