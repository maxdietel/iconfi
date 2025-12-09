"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Grade } from "ts-fsrs";

import { QuestionCardShell } from "./question-card-shell";
import { Option, Question } from "@/lib/supabase/types";

type MatchQuestionCardProps = {
  question: Question;
  options: Option[];
  onRate?: (rating: Grade) => void;
};

type MatchPairProps = {
  leftOption: Option;
  rightOptions: Option[];
  matchedPairs: Record<string, string>;
  showResults: boolean;
  leftOptions: Option[];
};

type DraggableRightItemProps = {
  option: Option;
  showResults: boolean;
  leftOptions: Option[];
};

function DraggableRightItem({ option, showResults, leftOptions }: DraggableRightItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: option.id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const correctLeftOptionIndex = showResults && option.correct_match_id
    ? leftOptions.findIndex((leftOpt) => leftOpt.id === option.correct_match_id)
    : -1;
  const correctPosition = correctLeftOptionIndex >= 0 ? correctLeftOptionIndex + 1 : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 rounded border bg-muted/50 hover:bg-muted transition-colors cursor-grab active:cursor-grabbing touch-none ${
        isDragging ? "z-50" : ""
      }`}
    >
      <div className="flex items-center justify-center gap-3">
        <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
        <span className="flex-1">{option.text}</span>
        {showResults && correctPosition !== null && (
          <span className="text-sm font-semibold text-muted-foreground w-6 text-right">
            {correctPosition}
          </span>
        )}
      </div>
    </div>
  );
}

function MatchPair({
  leftOption,
  rightOptions,
  matchedPairs,
  showResults,
  leftOptions,
}: MatchPairProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: leftOption.id,
  });

  const matchedRightId = matchedPairs[leftOption.id];
  const currentMatchedRight = matchedRightId
    ? rightOptions.find((opt) => opt.id === matchedRightId) ?? null
    : null;

  const borderClasses = isOver
    ? "border-white bg-muted"
    : showResults && currentMatchedRight
    ? currentMatchedRight.correct_match_id === leftOption.id
      ? "border-green-500 dark:border-green-400 bg-green-50/10 dark:bg-green-950/20"
      : "border-red-500 dark:border-red-400 bg-red-50/10 dark:bg-red-950/20"
    : "border-muted bg-muted/20";

  return (
    <div ref={setNodeRef} className={`rounded-lg border-2 p-3 transition-colors ${borderClasses}`}>
      <div className="p-3 rounded border bg-muted/50 mb-2">
        <div className="font-medium">{leftOption.text}</div>
      </div>
      {currentMatchedRight ? (
        <DraggableRightItem
          option={currentMatchedRight}
          showResults={showResults}
          leftOptions={leftOptions}
        />
      ) : (
        <div className="p-3 rounded border border-dashed border-muted-foreground/30 bg-muted/20">
          <div className="text-sm text-muted-foreground italic text-center">
            Drop right item here
          </div>
        </div>
      )}
    </div>
  );
}

export function MatchQuestionCard({ question, options, onRate }: MatchQuestionCardProps) {
  const leftOptions = useMemo(
    () => options.filter((opt) => opt.side === "left"),
    [options],
  );
  const rightOptions = useMemo(
    () => options.filter((opt) => opt.side === "right"),
    [options],
  );

  const initialMatchedPairs = useMemo(() => {
    return leftOptions.reduce((acc, leftOption, index) => {
      if (rightOptions[index]) {
        acc[leftOption.id] = rightOptions[index].id;
      }
      return acc;
    }, {} as Record<string, string>);
  }, [leftOptions, rightOptions]);

  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>(initialMatchedPairs);
  const [showResults, setShowResults] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMatchedPairs(initialMatchedPairs);
  }, [initialMatchedPairs]);

  useEffect(() => {
    setShowResults(false);
    setActiveId(null);
  }, [question]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      const activeRightItem = rightOptions.find((opt) => opt.id === active.id);
      if (!activeRightItem || !over) {
        return;
      }

      const leftItem = leftOptions.find((opt) => opt.id === over.id);
      if (!leftItem) {
        return;
      }

      setMatchedPairs((prev) => {
        const currentMatchedRightId = prev[leftItem.id];

        if (currentMatchedRightId && currentMatchedRightId !== active.id) {
          const leftItemForActive = Object.keys(prev).find(
            (key) => prev[key] === active.id,
          );

          if (leftItemForActive) {
            const newPairs = { ...prev };
            newPairs[leftItemForActive] = currentMatchedRightId;
            newPairs[leftItem.id] = active.id as string;
            return newPairs;
          }
          return prev;
        }

        if (prev[leftItem.id] === active.id) {
          return prev;
        }

        const newPairs = { ...prev };
        Object.keys(newPairs).forEach((key) => {
          if (newPairs[key] === active.id) {
            delete newPairs[key];
          }
        });
        newPairs[leftItem.id] = active.id as string;
        return newPairs;
      });
    },
    [leftOptions, rightOptions],
  );

  const isCorrect = showResults
    ? leftOptions.every((leftOption) => {
        const matchedRightId = matchedPairs[leftOption.id];
        if (!matchedRightId) {
          return false;
        }
        const matchedRight = rightOptions.find((opt) => opt.id === matchedRightId);
        return matchedRight?.correct_match_id === leftOption.id;
      })
    : null;

  return (
    <QuestionCardShell question={question} isCorrect={isCorrect}>
      <div className="mt-4 flex flex-col gap-2">
        <div className="text-sm font-semibold">Options:</div>
        {mounted ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col gap-4">
              {leftOptions.map((leftOption) => (
                <MatchPair
                  key={leftOption.id}
                  leftOption={leftOption}
                  rightOptions={rightOptions}
                  matchedPairs={matchedPairs}
                  showResults={showResults}
                  leftOptions={leftOptions}
                />
              ))}
            </div>
            <DragOverlay>
              {activeId ? (() => {
                const draggedOption = rightOptions.find((opt) => opt.id === activeId);
                const correctLeftOptionIndex = draggedOption?.correct_match_id
                  ? leftOptions.findIndex((leftOpt) => leftOpt.id === draggedOption.correct_match_id)
                  : -1;
                const correctPosition = correctLeftOptionIndex >= 0 ? correctLeftOptionIndex + 1 : null;

                return (
                  <div className="flex items-center justify-center gap-3 p-3 rounded border bg-muted/50 shadow-lg opacity-90">
                    <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span className="flex-1">{draggedOption?.text}</span>
                    {showResults && correctPosition !== null && (
                      <span className="text-sm font-semibold text-muted-foreground w-6 text-right">
                        {correctPosition}
                      </span>
                    )}
                  </div>
                );
              })() : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="flex flex-col gap-4">
            {leftOptions.map((leftOption) => (
              <div
                key={leftOption.id}
                className="rounded-lg border-2 border-muted bg-muted/20 p-3"
              >
                <div className="p-3 rounded border bg-muted/50 mb-2">
                  <div className="font-medium">{leftOption.text}</div>
                </div>
                <div className="p-3 rounded border border-dashed border-muted-foreground/30 bg-muted/20">
                  <div className="text-sm text-muted-foreground italic text-center">
                    Drop right item here
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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


