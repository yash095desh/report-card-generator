"use client";

import { Student } from "@/types";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, User } from "lucide-react";

interface StudentListProps {
  students: Student[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export function StudentList({
  students,
  selectedId,
  onSelect,
  onDelete,
  onNew,
}: StudentListProps) {
  return (
    <div className="border-b">
      <div className="flex items-center justify-between p-3 bg-muted/30">
        <h2 className="text-sm font-semibold">
          Students ({students.length})
        </h2>
        <Button size="sm" variant="outline" onClick={onNew} className="h-7 text-xs">
          <Plus className="w-3 h-3 mr-1" />
          New
        </Button>
      </div>
      {students.length === 0 ? (
        <p className="p-3 text-xs text-muted-foreground text-center">
          No students added yet
        </p>
      ) : (
        <div className="max-h-48 overflow-y-auto">
          {students.map((s) => (
            <div
              key={s.id}
              className={`flex items-center justify-between px-3 py-2 cursor-pointer border-b last:border-b-0 hover:bg-muted/30 transition-colors ${
                selectedId === s.id ? "bg-primary/10 border-l-2 border-l-primary" : ""
              }`}
              onClick={() => onSelect(s.id)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <User className="w-4 h-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {s.fullName || "Unnamed"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Roll: {s.rollNumber || "—"}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(s.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
