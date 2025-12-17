import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { QuestionCardShell } from "./question-card-shell";
import { Flashcard } from "@/app/topics/[topic]/types";

import { QuestionCardState } from "./types";

type SingleChoiceQuestionCardProps = {
  flashcard: Flashcard;
  side: "front" | "back";
  onStateChange?: (state: QuestionCardState) => void;
};

export function SingleChoiceQuestionCard({
  flashcard,
  side,
  onStateChange,
}: SingleChoiceQuestionCardProps) {
  const { question } = flashcard;
  const { options } = question;

  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>(undefined);
  const isBack = side === "back";
  const correctOptionId = options.find((opt) => opt.is_correct === true)?.id;

  // Reset selection when card changes
  useEffect(() => {
    setSelectedOptionId(undefined);
  }, [flashcard.question.id]);

  // Report state changes (selection and correctness)
  useEffect(() => {
    const hasSelection = selectedOptionId !== undefined;
    const isAnswerCorrect = isBack && hasSelection
      ? selectedOptionId === correctOptionId
      : null;
    
    onStateChange?.({ hasSelection, isAnswerCorrect });
  }, [isBack, selectedOptionId, correctOptionId, onStateChange]);

  return (
    <QuestionCardShell flashcard={flashcard}>
      <RadioGroup 
        value={selectedOptionId} 
        onValueChange={(value) => setSelectedOptionId(value)}
        className="flex flex-col gap-2" 
        disabled={isBack}
      >
        {options.map((option) => {
          const isCorrect = option.is_correct === true;
          const isSelected = selectedOptionId === option.id;

          let borderClass = "";
          if (isBack) {
            if (isSelected && isCorrect) {
              // User selected it and it's correct - green solid border
              borderClass = "border-green-500 dark:border-green-400";
            } else if (!isSelected && isCorrect) {
              // User didn't select it but it's correct - green dashed border (missed answer)
              borderClass = "border-green-500 dark:border-green-400 border-dashed";
            } else if (isSelected && !isCorrect) {
              // User selected it but it's wrong - red border
              borderClass = "border-red-500 dark:border-red-400";
            }
          }

          return (
            <Label
              key={option.id}
              htmlFor={option.id}
              className={`flex items-center justify-center gap-3 p-3 rounded border bg-muted/50 hover:bg-muted transition-colors cursor-pointer ${borderClass}`}
            >
              <RadioGroupItem value={option.id} id={option.id} disabled={isBack} />
              <span className="flex-1">{option.text}</span>
            </Label>
          );
        })}
      </RadioGroup>
    </QuestionCardShell>
  );
}
