"use client";

import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FC, useState, useEffect, useCallback } from "react";
import { TopicFooter } from "./footer";
import Link from "next/link";
import { QuestionCard } from "@/components/question-card";
import { useFlashcards } from "./hooks";
import { Badge } from "@/components/ui/badge";

interface TopicPageClientProps {
  topic: string;
}
export const TopicPageClient: FC<TopicPageClientProps> = ({ topic }) => {
  const { currentFlashcard, flashcardsData } = useFlashcards();
  const { stats } = flashcardsData;

  const [side, setSide] = useState<"front" | "back">("front");
  const [hasSelection, setHasSelection] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Reset state when card changes
  useEffect(() => {
    setSide("front");
    setHasSelection(false);
    setIsAnswerCorrect(null);
  }, [currentFlashcard?.question.id]);

  const handleStateChange = useCallback((state: { hasSelection: boolean; isAnswerCorrect: boolean | null }) => {
    setHasSelection(state.hasSelection);
    setIsAnswerCorrect(state.isAnswerCorrect);
  }, []);

  const handleReveal = useCallback(() => {
    setSide("back");
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b border-b-border flex-shrink-0">
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center p-2">
          <div className="flex items-center gap-2">
              <Link href="/topics" className={buttonVariants({ variant: "ghost", size: "icon" })}>
                <ArrowLeft size={16} />
              </Link>
            <h1 className="font-medium">{topic}</h1>
          </div>

          <div className="flex items-center gap-1">
            <Badge className="bg-sky-500">{stats.newDue}</Badge>
            <Badge className="bg-yellow-500">{stats.learningDue}</Badge>
            <Badge className="bg-violet-500">{stats.reviewDue}</Badge>
          </div>
        </div>
      </header>

      {currentFlashcard ? (
        <>
          <main className="flex flex-col max-w-5xl mx-auto w-full p-4 gap-4 overflow-y-auto flex-1 min-h-0">
            <QuestionCard
              flashcard={currentFlashcard}
              side={side}
              onStateChange={handleStateChange}
            />
          </main>

          <TopicFooter
            side={side}
            hasSelection={hasSelection}
            isAnswerCorrect={isAnswerCorrect}
            onReveal={handleReveal}
          />
        </>
      ) : (
        <main className="flex flex-col items-center justify-center gap-4 flex-1 text-muted-foreground">
          <p className="text-lg font-medium text-foreground">Alles gelernt für jetzt!</p>
          <p>Komm später wieder, wenn neue Karten fällig sind.</p>
          <Link href="/topics" className={buttonVariants({ variant: "default" })}>
            Zurück zu den Themen
          </Link>
        </main>
      )}
    </div>
  )
}
