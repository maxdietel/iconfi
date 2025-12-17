import { useState, useEffect, useMemo, useCallback } from "react";
import { GripVertical } from "lucide-react";
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

import { QuestionCardShell } from "./question-card-shell";
import { Flashcard } from "@/app/topics/[topic]/types";
import { QuestionCardState } from "./types";

type MatchQuestionCardProps = {
  flashcard: Flashcard;
  side: "front" | "back";
  onStateChange?: (state: QuestionCardState) => void;
};

type DraggableRightItemProps = {
  option: { id: string; text: string; correct_match_id?: string | null };
  isBack: boolean;
};

type DroppableLeftItemProps = {
  leftOption: { id: string; text: string };
  matchedRightId: string | undefined;
  rightOptions: Array<{ id: string; text: string; correct_match_id?: string | null }>;
  isBack: boolean;
};

function DraggableRightItem({ option, isBack }: DraggableRightItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: option.id,
    disabled: isBack,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex-1 p-3 rounded-r border border-muted bg-muted/50 hover:bg-muted transition-colors cursor-grab active:cursor-grabbing touch-none ${
        isDragging ? "z-50" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
        <span className="flex-1 text-sm">{option.text}</span>
      </div>
    </div>
  );
}

function DroppableLeftItem({
  leftOption,
  matchedRightId,
  rightOptions,
  isBack,
}: DroppableLeftItemProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: leftOption.id,
    disabled: isBack,
  });

  const matchedRight = matchedRightId
    ? rightOptions.find((opt) => opt.id === matchedRightId) ?? null
    : null;

  const isCorrectMatch = isBack && matchedRight && matchedRight.correct_match_id === leftOption.id;
  const isIncorrectMatch = isBack && matchedRight && matchedRight.correct_match_id !== leftOption.id;

  const correctRight = isBack && isIncorrectMatch
    ? rightOptions.find((opt) => opt.correct_match_id === leftOption.id) ?? null
    : null;

  const borderClasses = isOver && !isBack
    ? "border-white bg-muted"
    : isBack && isCorrectMatch
    ? "border-green-500 dark:border-green-400 bg-green-50/10 dark:bg-green-950/20"
    : isBack && isIncorrectMatch
    ? "border-red-500 dark:border-red-400 bg-red-50/10 dark:bg-red-950/20"
    : "border-muted";

  const truncateText = (text: string) => {
    return text.length > 10 ? text.slice(0, 10) + "..." : text;
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 p-3 rounded-l border bg-muted/50 transition-colors ${borderClasses}`}
    >
      <div className="font-medium text-sm">{leftOption.text}</div>
      {isIncorrectMatch && correctRight && (
        <div className="text-sm text-muted-foreground mt-1">
          → {truncateText(correctRight.text)}
        </div>
      )}
    </div>
  );
}

export function MatchQuestionCard({
  flashcard,
  side,
  onStateChange,
}: MatchQuestionCardProps) {
  const { question } = flashcard;
  const { options } = question;

  const [matches, setMatches] = useState<Map<string, string>>(new Map()); // leftOptionId -> rightOptionId
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const isBack = side === "back";

  const leftOptions = useMemo(
    () => options.filter((opt) => opt.side === "left"),
    [options],
  );
  const rightOptions = useMemo(
    () => options.filter((opt) => opt.side === "right"),
    [options],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize with random matches when card changes
  useEffect(() => {
    const newMatches = new Map<string, string>();
    const shuffledRightOptions = [...rightOptions].sort(() => Math.random() - 0.5);
    
    leftOptions.forEach((leftOption, index) => {
      if (shuffledRightOptions[index]) {
        newMatches.set(leftOption.id, shuffledRightOptions[index].id);
      }
    });
    
    setMatches(newMatches);
    setActiveId(null);
  }, [flashcard.question.id, leftOptions, rightOptions]);

  // Report state changes (selection and correctness)
  useEffect(() => {
    const hasSelection = matches.size === leftOptions.length && leftOptions.length > 0;
    
    let isAnswerCorrect: boolean | null = null;
    if (isBack && hasSelection) {
      // Check if all matches are correct
      isAnswerCorrect = Array.from(matches.entries()).every(([leftId, rightId]) => {
        const rightOption = rightOptions.find(opt => opt.id === rightId);
        return rightOption?.correct_match_id === leftId;
      });
    }
    
    onStateChange?.({ hasSelection, isAnswerCorrect });
  }, [isBack, matches, leftOptions, rightOptions, onStateChange]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (!isBack) {
      setActiveId(event.active.id as string);
    }
  }, [isBack]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (isBack || !over) {
        return;
      }

      const activeRightItem = rightOptions.find((opt) => opt.id === active.id);
      if (!activeRightItem) {
        return;
      }

      const leftItem = leftOptions.find((opt) => opt.id === over.id);
      if (!leftItem) {
        return;
      }

      setMatches((prev) => {
        const newMatches = new Map(prev);
        const currentMatchedRightId = newMatches.get(leftItem.id);

        // If there's already a match for this left item, swap them
        if (currentMatchedRightId && currentMatchedRightId !== active.id) {
          // Find which left item currently has the active right item
          const leftItemForActive = Array.from(newMatches.entries()).find(
            ([, rightId]) => rightId === active.id,
          )?.[0];

          if (leftItemForActive) {
            // Swap: move current match to the left item that had the active item
            newMatches.set(leftItemForActive, currentMatchedRightId);
            newMatches.set(leftItem.id, active.id as string);
          }
        } else {
          // Remove the active item from any previous match
          Array.from(newMatches.entries()).forEach(([leftId, rightId]) => {
            if (rightId === active.id) {
              newMatches.delete(leftId);
            }
          });
          // Set the new match
          newMatches.set(leftItem.id, active.id as string);
        }

        return newMatches;
      });
    },
    [isBack, leftOptions, rightOptions],
  );

  if (!mounted) {
    return (
      <QuestionCardShell flashcard={flashcard}>
        <div className="flex flex-col gap-2">
          {leftOptions.map((leftOption) => (
            <div
              key={leftOption.id}
              className="p-3 rounded-l border-l-4 border-r-0 border-t border-b border-l-muted bg-muted/50"
            >
              <div className="font-medium">{leftOption.text}</div>
            </div>
          ))}
        </div>
      </QuestionCardShell>
    );
  }

  return (
    <QuestionCardShell flashcard={flashcard}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col gap-2">
          {leftOptions.map((leftOption) => {
            const matchedRightId = matches.get(leftOption.id);
            
            return (
              <div key={leftOption.id} className="flex items-stretch gap-2">
                <DroppableLeftItem
                  leftOption={leftOption}
                  matchedRightId={matchedRightId}
                  rightOptions={rightOptions}
                  isBack={isBack}
                />
                {matchedRightId && (
                  <DraggableRightItem
                    option={rightOptions.find(opt => opt.id === matchedRightId)!}
                    isBack={isBack}
                  />
                )}
              </div>
            );
          })}
        </div>
        <DragOverlay>
          {activeId ? (() => {
            const draggedOption = rightOptions.find((opt) => opt.id === activeId);

            return (
              <div className="flex items-center gap-3 p-3 rounded-r border bg-muted/50 shadow-lg opacity-90">
                <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
                <span className="flex-1 text-sm">{draggedOption?.text}</span>
              </div>
            );
          })() : null}
        </DragOverlay>
      </DndContext>
    </QuestionCardShell>
  );
}
