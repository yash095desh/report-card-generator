"use client";

import { Student, Category, Medium, Grade, Division } from "@/types";
import { calculateStudentResult } from "@/lib/calculations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarksTable } from "./MarksTable";

interface StudentFormProps {
  student: Student;
  onChange: (student: Student) => void;
  onSave: () => void;
  onUpdate: () => void;
  isEditing: boolean;
}

const categories: Category[] = ["General", "OBC", "OBC-A", "OBC-B", "SC", "ST"];
const mediums: Medium[] = ["Hindi", "English"];
const grades: Grade[] = ["A+", "A", "B+", "B", "C+", "C", "D", "E", "E1", "E2"];
const divisions: Division[] = ["FIRST DIVISION", "SECOND DIVISION", "THIRD DIVISION", "FAIL"];

function FormField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function StudentForm({
  student,
  onChange,
  onSave,
  onUpdate,
  isEditing,
}: StudentFormProps) {
  const result = calculateStudentResult(student);

  const updateField = <K extends keyof Student>(field: K, value: Student[K]) => {
    onChange({ ...student, [field]: value });
  };

  const updateOverride = (key: string, value: string) => {
    onChange({
      ...student,
      overrides: { ...student.overrides, [key]: value || undefined },
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateField("photo", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">
        {isEditing ? "Edit Student" : "Add New Student"}
      </h2>

      {/* Personal Info */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">
          Personal Information
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Full Name" className="col-span-2">
            <Input
              value={student.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              placeholder="Student full name"
            />
          </FormField>
          <FormField label="Father's Name">
            <Input
              value={student.fatherName}
              onChange={(e) => updateField("fatherName", e.target.value)}
              placeholder="Father's name"
            />
          </FormField>
          <FormField label="Mother's Name">
            <Input
              value={student.motherName}
              onChange={(e) => updateField("motherName", e.target.value)}
              placeholder="Mother's name"
            />
          </FormField>
          <FormField label="Date of Birth">
            <Input
              type="date"
              value={student.dateOfBirth}
              onChange={(e) => updateField("dateOfBirth", e.target.value)}
            />
          </FormField>
          <FormField label="Category">
            <Select
              value={student.category}
              onValueChange={(v) => updateField("category", v as Category)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Roll Number">
            <Input
              value={student.rollNumber}
              onChange={(e) => updateField("rollNumber", e.target.value)}
              placeholder="Roll number"
            />
          </FormField>
          <FormField label="Scholar Number">
            <Input
              value={student.scholarNumber}
              onChange={(e) => updateField("scholarNumber", e.target.value)}
              placeholder="Scholar number"
            />
          </FormField>
          <FormField label="Enrolment Number">
            <Input
              value={student.enrolmentNumber}
              onChange={(e) => updateField("enrolmentNumber", e.target.value)}
              placeholder="Enrolment number"
            />
          </FormField>
          <FormField label="Samagra ID">
            <Input
              value={student.samagraId}
              onChange={(e) => updateField("samagraId", e.target.value)}
              placeholder="Samagra ID"
            />
          </FormField>
          <FormField label="Aadhaar Number">
            <Input
              value={student.aadhaarNumber}
              onChange={(e) => updateField("aadhaarNumber", e.target.value)}
              placeholder="Aadhaar number"
            />
          </FormField>
          <FormField label="Medium">
            <Select
              value={student.medium}
              onValueChange={(v) => updateField("medium", v as Medium)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mediums.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        {/* Photo Upload */}
        <FormField label="Student Photo (optional)">
          <div className="flex items-center gap-3">
            <Input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="flex-1"
            />
            {student.photo && (
              <img
                src={student.photo}
                alt="Student"
                className="w-10 h-12 object-cover border rounded"
              />
            )}
          </div>
        </FormField>
      </div>

      {/* Attendance */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">
          Attendance
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Days Present">
            <Input
              type="number"
              min={0}
              value={student.attendancePresent}
              onChange={(e) =>
                updateField(
                  "attendancePresent",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              placeholder="0"
            />
          </FormField>
          <FormField label="Total Working Days">
            <Input
              type="number"
              min={0}
              value={student.attendanceTotal}
              onChange={(e) =>
                updateField(
                  "attendanceTotal",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              placeholder="0"
            />
          </FormField>
        </div>
      </div>

      {/* Marks Entry */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">
          Marks Entry
        </h3>
        <MarksTable student={student} onChange={onChange} />
      </div>

      {/* Auto-calculated Results (editable) */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">
          Result (auto-calculated, editable)
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <FormField label={`Total Marks (${result.totalMarks}/${result.maxMarks})`}>
            <Input value={result.totalMarks} disabled className="bg-muted/30" />
          </FormField>
          <FormField label={`Percentage (${result.percentage}%)`}>
            <Input value={result.percentage} disabled className="bg-muted/30" />
          </FormField>
          <FormField label="Grade">
            <Select
              value={student.overrides.grade ?? result.grade}
              onValueChange={(v) => updateOverride("grade", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {grades.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Division">
            <Select
              value={student.overrides.division ?? result.division}
              onValueChange={(v) => updateOverride("division", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Result">
            <Select
              value={student.overrides.result ?? result.result}
              onValueChange={(v) => updateOverride("result", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PASS">PASS</SelectItem>
                <SelectItem value="FAIL">FAIL</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Env. Education Grade">
            <Input
              value={student.overrides.envEducationGrade ?? "A+"}
              onChange={(e) => updateOverride("envEducationGrade", e.target.value)}
            />
          </FormField>
        </div>
        <FormField label="Total Marks in Words">
          <Input
            value={student.overrides.totalInWords ?? result.totalInWords}
            onChange={(e) => updateOverride("totalInWords", e.target.value)}
            placeholder="Auto-generated"
          />
        </FormField>
      </div>

      {/* Staff & Other */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">
          Staff & Other Details
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Class Teacher Name">
            <Input
              value={student.classTeacherName}
              onChange={(e) => updateField("classTeacherName", e.target.value)}
              placeholder="Class teacher name"
            />
          </FormField>
          <FormField label="Exam Incharge Name">
            <Input
              value={student.examInchargeName}
              onChange={(e) => updateField("examInchargeName", e.target.value)}
              placeholder="Exam incharge name"
            />
          </FormField>
          <FormField label="Principal Name">
            <Input
              value={student.principalName}
              onChange={(e) => updateField("principalName", e.target.value)}
              placeholder="Principal name"
            />
          </FormField>
          <FormField label="Publish Date">
            <Input
              type="date"
              value={student.publishDate}
              onChange={(e) => updateField("publishDate", e.target.value)}
            />
          </FormField>
        </div>
        <FormField label="Remarks">
          <Input
            value={student.remarks}
            onChange={(e) => updateField("remarks", e.target.value)}
            placeholder="Optional remarks"
          />
        </FormField>
      </div>

      {/* Save/Update Button */}
      <div className="pt-2">
        <Button
          onClick={isEditing ? onUpdate : onSave}
          className="w-full"
          size="lg"
        >
          {isEditing ? "Update Student" : "Save Student"}
        </Button>
      </div>
    </div>
  );
}
