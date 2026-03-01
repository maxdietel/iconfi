"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, GripVertical, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { QuestionCardShell } from "./question-card-shell";
import { Flashcard } from "@/app/topics/[topic]/types";
import { QuestionCardState } from "./types";
import { useColorblindMode } from "@/components/colorblind-mode-provider";

type OrderQuestionCardProps = {
  flashcard: Flashcard;
  side: "front" | "back";
  onStateChange?: (state: QuestionCardState) => void;
};

type SortableOptionItemProps = {
  option: { id: string; text: string; correct_order_index?: number | null };
  index: number;
  isBack: boolean;
  isColorblindMode: boolean;
  disabled?: boolean;
};

function SortableOptionItem({
  option,
  index,
  isBack,
  isColorblindMode,
  disabled = false,
}: SortableOptionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: option.id,
    disabled: disabled || isBack,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const correctIndex = option.correct_order_index ?? 0;
  // Check if this option is in the correct position based on user's order
  const isInCorrectPosition = isBack && correctIndex === index;
  const borderClass = isBack && isInCorrectPosition
    ? "border-2 border-green-500 dark:border-green-400"
    : isBack && !isInCorrectPosition
    ? "border-2 border-red-500 dark:border-red-400"
    : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-center gap-3 p-3 rounded border bg-muted/50 hover:bg-muted transition-colors cursor-grab active:cursor-grabbing touch-none ${
        isDragging ? "shadow-lg z-50" : ""
      } ${borderClass}`}
      aria-invalid={isBack && !isInCorrectPosition}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-5 w-5 text-muted-foreground" />
      <span className="flex-1">{option.text}</span>
      {isBack && isColorblindMode && (
        <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">
          {isInCorrectPosition ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {isInCorrectPosition ? "Richtig" : "Falsch"}
        </span>
      )}
      {isBack && (
        <span className="text-sm font-semibold text-muted-foreground w-6 text-right">
          {correctIndex + 1}
        </span>
      )}
    </div>
  );
}

export function OrderQuestionCard({
  flashcard,
  side,
  onStateChange,
}: OrderQuestionCardProps) {
  const { question } = flashcard;
  const { options } = question;

  const [orderedOptionIds, setOrderedOptionIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const isBack = side === "back";
  const { isColorblindMode } = useColorblindMode();

  // Initialize orderedOptionIds with all option IDs in original order when component mounts or card changes
  useEffect(() => {
    setOrderedOptionIds(options.map(opt => opt.id));
  }, [flashcard.question.id, options]);

  // Report state changes (selection and correctness)
  useEffect(() => {
    const hasSelection = orderedOptionIds.length === options.length;

    let isAnswerCorrect: boolean | null = null;
    if (isBack && hasSelection) {
      // Check if the order matches the correct order
      isAnswerCorrect = orderedOptionIds.every((optionId, index) => {
        const option = options.find(opt => opt.id === optionId);
        return option && (option.correct_order_index ?? -1) === index;
      });
    }

    onStateChange?.({ hasSelection, isAnswerCorrect });
  }, [isBack, orderedOptionIds, options, onStateChange]);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start event
  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (!isBack) {
      setActiveId(event.active.id as string);
    }
  }, [isBack]);

  // Handle drag end event
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id && !isBack) {
      setOrderedOptionIds((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, [isBack]);

  // Always show user's ordered selection, even on back side
  // On back side, we'll add visual indicators for correctness
  const displayedOptions = orderedOptionIds
    .map((id) => options.find((opt) => opt.id === id))
    .filter(Boolean) as typeof options;

  return (
    <QuestionCardShell flashcard={flashcard}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedOptionIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {displayedOptions.map((option, index) => (
              <SortableOptionItem
                key={option.id}
                option={option}
                index={index}
                isBack={isBack}
                isColorblindMode={isColorblindMode}
                disabled={isBack}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <div className="flex items-center justify-center gap-3 p-3 rounded border bg-muted/50 shadow-lg opacity-90">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1">
                {displayedOptions.find((opt) => opt.id === activeId)?.text}
              </span>
              {isBack && (
                <span className="text-sm font-semibold text-muted-foreground w-6 text-right">
                  {(displayedOptions.find((opt) => opt.id === activeId)?.correct_order_index ?? 0) + 1}
                </span>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </QuestionCardShell>
  );
}
