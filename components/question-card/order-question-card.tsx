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
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Grade } from "ts-fsrs";

import { QuestionCardShell } from "./question-card-shell";
import { Option, Question } from "@/lib/supabase/types";

type OrderQuestionCardProps = {
  question: Question;
  options: Option[];
  onRate?: (rating: Grade) => void;
};

type SortableOptionItemProps = {
  option: Option;
  index: number;
  showResults: boolean;
};

function SortableOptionItem({ option, index, showResults }: SortableOptionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: option.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const correctIndex = option.correct_order_index ?? 0;
  const isAtCorrectPosition = showResults && index === correctIndex;
  const isAtWrongPosition = showResults && index !== correctIndex;

  const borderClass = showResults
    ? isAtCorrectPosition
      ? "border-green-500 dark:border-green-400"
      : isAtWrongPosition
      ? "border-red-500 dark:border-red-400"
      : ""
    : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center justify-center gap-3 p-3 rounded border bg-muted/50 hover:bg-muted transition-colors cursor-grab active:cursor-grabbing touch-none ${
        isDragging ? "shadow-lg z-50" : ""
      } ${borderClass}`}
    >
      <GripVertical className="h-5 w-5 text-muted-foreground" />
      <span className="flex-1">{option.text}</span>
      {showResults && (
        <span className="text-sm font-semibold text-muted-foreground w-6 text-right">
          {correctIndex + 1}
        </span>
      )}
    </div>
  );
}

export function OrderQuestionCard({ question, options, onRate }: OrderQuestionCardProps) {
  const initialOrderedOptions = useMemo(
    () =>
      [...options].sort((a, b) => {
        const aIndex = a.correct_order_index ?? 0;
        const bIndex = b.correct_order_index ?? 0;
        return aIndex - bIndex;
      }),
    [options],
  );

  const [orderedOptions, setOrderedOptions] = useState<Option[]>(initialOrderedOptions);
  const [showResults, setShowResults] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOrderedOptions(initialOrderedOptions);
    setShowResults(false);
    setActiveId(null);
  }, [initialOrderedOptions, question.id]);

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

      if (over && active.id !== over.id) {
        setOrderedOptions((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    },
    [],
  );

  const isCorrect = showResults
    ? orderedOptions.every((option, index) => {
        const correctIndex = option.correct_order_index ?? 0;
        return index === correctIndex;
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
            <SortableContext
              items={orderedOptions.map((opt) => opt.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2">
                {orderedOptions.map((option, index) => (
                  <SortableOptionItem
                    key={option.id}
                    option={option}
                    index={index}
                    showResults={showResults}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <div className="flex items-center justify-center gap-3 p-3 rounded border bg-muted/50 shadow-lg opacity-90">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1">
                    {orderedOptions.find((opt) => opt.id === activeId)?.text}
                  </span>
                  {showResults && (
                    <span className="text-sm font-semibold text-muted-foreground w-6 text-right">
                      {(orderedOptions.find((opt) => opt.id === activeId)?.correct_order_index ?? 0) + 1}
                    </span>
                  )}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="flex flex-col gap-2">
            {orderedOptions.map((option) => (
              <div
                key={option.id}
                className="flex items-center justify-center gap-3 p-3 rounded border bg-muted/50"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <span className="flex-1">{option.text}</span>
                {showResults && (
                  <span className="text-sm font-semibold text-muted-foreground w-6 text-right">
                    {(option.correct_order_index ?? 0) + 1}
                  </span>
                )}
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


