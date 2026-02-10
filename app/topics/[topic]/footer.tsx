"use client";

import { FC, useState } from "react";
import { useFlashcards } from "./hooks";
import { Button } from "@/components/ui/button";
import { Rating } from "ts-fsrs";
import { MessageCircleQuestionIcon, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { RelatedPagesDrawerContent } from "./related-pages-drawer";

interface TopicFooterProps {
  side: "front" | "back";
  hasSelection: boolean;
  isAnswerCorrect: boolean | null;
  onReveal: () => void;
}
export const TopicFooter: FC<TopicFooterProps> = ({ 
  side, 
  hasSelection, 
  isAnswerCorrect,
  onReveal,
}) => {
  const { currentFlashcard, gradeFlashcard, toggleDislikeQuestion } = useFlashcards();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isTogglingDislike, setIsTogglingDislike] = useState(false);

  if (!currentFlashcard) {
    return null;
  }

  // Wrong answer: show next card button (automatically grades as Hard)
  const handleNextCard = async () => {
    await gradeFlashcard(currentFlashcard, Rating.Hard);
    // State will be reset automatically when currentFlashcard changes
  };

  const pages = currentFlashcard.question.learning_material_pages || [];
  const explanation = currentFlashcard.question.ai_explanation || "";
  const isDisliked = currentFlashcard.isDisliked;

  const handleToggleDislike = async () => {
    setIsTogglingDislike(true);
    try {
      await toggleDislikeQuestion(currentFlashcard);
    } finally {
      setIsTogglingDislike(false);
    }
  };

  const FloatingDislikeButton = (
    <Button
      variant="ghost"
      size="icon"
      disabled={isTogglingDislike}
      onClick={handleToggleDislike}
      aria-pressed={isDisliked}
      aria-label={isDisliked ? "Frage ist disliked. Dislike entfernen" : "Frage disliken"}
      title={isDisliked ? "Disliked aktiv" : "Dislike"}
      className={cn(
        "absolute right-0 top-1/2 -translate-y-1/2 z-10",
        isDisliked
          ? "text-destructive bg-destructive/10 hover:bg-destructive/20"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <span className="relative">
        <ThumbsDown />
        {isDisliked && (
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-destructive" />
        )}
      </span>
    </Button>
  );

  const FloatingDrawerButton = (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
          title="Erklaerung und Lernseiten"
        >
          <MessageCircleQuestionIcon />
        </Button>
      </DrawerTrigger>
      <RelatedPagesDrawerContent explanation={explanation} pages={pages} />
    </Drawer>
  );

  // Front side: show reveal button (disabled if no selection)
  if (side === "front") {
    return (
      <footer className="border-t border-t-border flex-shrink-0">
        <div className="max-w-5xl mx-auto w-full p-2">
          <div className="relative flex items-center">
            {FloatingDislikeButton}
            <div className="flex w-full justify-center items-center gap-2 px-12 sm:px-14">
              <Button
                onClick={onReveal}
                disabled={!hasSelection}
                className="grow"
              >
                Antwort anzeigen
              </Button>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Back side: show grading buttons if correct, or next card button if wrong
  if (isAnswerCorrect === true) {
    return (
      <>
        <footer className="border-t border-t-border flex-shrink-0">
          <div className="max-w-5xl mx-auto w-full p-2">
            <div className="relative flex items-center">
              {FloatingDrawerButton}
              {FloatingDislikeButton}
            <div className="flex w-full justify-center items-center gap-2 px-12 sm:px-14">
                <Button onClick={async () => await gradeFlashcard(currentFlashcard, Rating.Hard)} className="grow basis-1/3 bg-orange-500 hover:bg-orange-500/90">Schwer</Button>
                <Button onClick={async () => await gradeFlashcard(currentFlashcard, Rating.Good)} className="grow basis-1/3 bg-green-500 hover:bg-green-500/90">Gut</Button>
                <Button onClick={async () => await gradeFlashcard(currentFlashcard, Rating.Easy)} className="grow basis-1/3 bg-blue-500 hover:bg-blue-500/90">Einfach</Button>
              </div>
            </div>
          </div>
        </footer>
      </>
    );
  }

  // Wrong answer (or null, shouldn't happen, but fallback): show next card button
  return (
    <>
      <footer className="border-t border-t-border flex-shrink-0">
        <div className="max-w-5xl mx-auto w-full p-2">
          <div className="relative flex items-center">
            {FloatingDrawerButton}
            {FloatingDislikeButton}
            <div className="flex w-full justify-center items-center gap-2 px-12 sm:px-14">
              <Button onClick={handleNextCard} className="grow">
                Nächste Karte
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}