"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { Grade } from "ts-fsrs";

import { QuestionCardShell } from "./question-card-shell";
import { Option, Question } from "@/lib/supabase/types";

type MultipleChoiceQuestionCardProps = {
  question: Question;
  options: Option[];
  onRate?: (rating: Grade) => void;
};

export function MultipleChoiceQuestionCard({
  question,
  options,
  onRate,
}: MultipleChoiceQuestionCardProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setSelectedValues([]);
    setShowResults(false);
  }, [question]);

  const handleCheckboxChange = (optionId: string, checked: boolean) => {
    setSelectedValues((prev) =>
      checked ? [...prev, optionId] : prev.filter((id) => id !== optionId),
    );
  };

  const isCorrect = showResults
    ? (() => {
        const correctOptions = options.filter((opt) => opt.is_correct === true);
        const allCorrectSelected = correctOptions.every((opt) =>
          selectedValues.includes(opt.id),
        );
        const noWrongSelected = !options.some(
          (opt) => opt.is_correct === false && selectedValues.includes(opt.id),
        );
        return allCorrectSelected && noWrongSelected;
      })()
    : null;

  return (
    <QuestionCardShell question={question} isCorrect={isCorrect}>
      <div className="mt-4 flex flex-col gap-2">
        <div className="text-sm font-semibold">Options:</div>
        <div className="flex flex-col gap-2">
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.id);
            const isOptionCorrect = option.is_correct === true;

            let borderClass = "";
            if (showResults) {
              if (isSelected && isOptionCorrect) {
                borderClass = "border-green-500 dark:border-green-400";
              } else if (!isSelected && isOptionCorrect) {
                borderClass = "border-green-500 dark:border-green-400 border-dashed";
              } else if (isSelected && !isOptionCorrect) {
                borderClass = "border-red-500 dark:border-red-400";
              }
            } else {
              borderClass = isSelected ? "border-white" : "";
            }

            return (
              <Label
                key={option.id}
                htmlFor={option.id}
                className={`flex items-center justify-center gap-3 p-3 rounded border bg-muted/50 hover:bg-muted transition-colors cursor-pointer ${borderClass}`}
              >
                <Checkbox
                  id={option.id}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(option.id, checked as boolean)
                  }
                  disabled={showResults}
                />
                <span className="flex-1">{option.text}</span>
              </Label>
            );
          })}
        </div>
        {!showResults ? (
          <Button onClick={() => setShowResults(true)} className="mt-4" variant="outline">
            Correct Questions
          </Button>
        ) : isCorrect ? (
          <div className="mt-4 flex gap-2">
            {([2, 3, 4] as Grade[]).map((grade) => (
              <Button
                key={grade}
                variant="outline"
                onClick={() => onRate?.(grade)}
              >
                {grade === 2 ? "Hard" : grade === 3 ? "Good" : "Easy"}
              </Button>
            ))}
          </div>
        ) : (
          <Button
            onClick={() => onRate?.(1 as Grade)}
            className="mt-4"
            variant="outline"
          >
            Next question
          </Button>
        )}
      </div>
    </QuestionCardShell>
  );
}


