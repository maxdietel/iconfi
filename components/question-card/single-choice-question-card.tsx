"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { QuestionCardShell } from "./question-card-shell";
import { Question, Option } from "@/lib/supabase/types";
import { Grade } from "ts-fsrs";

type SingleChoiceQuestionCardProps = {
  question: Question;
  options: Option[];
  onRate?: (rating: Grade) => void;
};

export function SingleChoiceQuestionCard({
  question,
  options,
  onRate,
}: SingleChoiceQuestionCardProps) {
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setSelectedValue("");
    setShowResults(false);
  }, [question]);

  const isCorrect = showResults
    ? (() => {
        if (!selectedValue) return false;
        const selectedOption = options.find((opt) => opt.id === selectedValue);
        return selectedOption?.is_correct === true;
      })()
    : null;

  return (
    <QuestionCardShell question={question} isCorrect={isCorrect}>
      <div className="mt-4 flex flex-col gap-2">
        <div className="text-sm font-semibold">Options:</div>
        <RadioGroup
          value={selectedValue}
          onValueChange={setSelectedValue}
          className="flex flex-col gap-2"
          disabled={showResults}
        >
          {options.map((option) => {
            const isSelected = selectedValue === option.id;
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
                <RadioGroupItem value={option.id} id={option.id} disabled={showResults} />
                <span className="flex-1">{option.text}</span>
              </Label>
            );
          })}
        </RadioGroup>
        {!showResults ? (
          <Button onClick={() => setShowResults(true)} className="mt-4" variant="outline">
            Correct Questions
          </Button>
        ) : isCorrect ? (
          <div className="mt-4 flex gap-2">
            {[2,3,4].map((grade) => (
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
            onClick={() => onRate?.(1)}
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


