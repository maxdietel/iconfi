"use client";

import { createContext, FC, useState, useMemo } from "react";
import {
  generatorParameters,
  FSRS,
  Grade,
} from "ts-fsrs";
import { createClient } from "@/lib/supabase/client";
import { getTopicFlashcardsData, removeCardFromSessionData } from "./utils";
import { Flashcard, TopicFlashcardsData } from "./types";

const fsrsParams = generatorParameters({
  enable_fuzz: true,
  enable_short_term: true,
});
const fsrs = new FSRS(fsrsParams);

/**
 * Combines two IDs and converts them to a hash number.
 * Used for deterministic but seemingly random card selection.
 */
function hashIds(id1: string, id2: string): number {
  // Combine the IDs and convert to a number
  const combined = id1 + id2;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Gets the next card to show, mixing new cards and review cards deterministically.
 * Uses a hash-based approach to ensure "random" but deterministic selection.
 */
function getNextCard(data: TopicFlashcardsData): Flashcard | null {
  const { new: newCards, review: reviewCards } = data.cards;

  if (reviewCards.length === 0 && newCards.length === 0) {
    return null;
  }

  if (reviewCards.length === 0) {
    return newCards[0];
  }

  if (newCards.length === 0) {
    return reviewCards[0];
  }

  const newCard = newCards[0];
  const reviewCard = reviewCards[0];

  // Use question.id as the identifier since cards might not have an id yet (for new cards)
  const newCardId = newCard.id || newCard.question.id;
  const reviewCardId = reviewCard.id || reviewCard.question.id;

  // Hacky way to ensure that the comparison of new cards and review cards is "random"
  // but deterministic
  if (hashIds(newCardId, reviewCardId) % 4 === 0) {
    return newCard;
  }

  return reviewCard;
}

export const FlashcardsContext = createContext<{
  flashcardsData: TopicFlashcardsData;
  currentFlashcard: Flashcard | null;
  gradeFlashcard: (flashcard: Flashcard, grade: Grade) => void;
}>({
  flashcardsData: { cards: { new: [], review: [] }, stats: { total: 0, new: 0, learning: 0, review: 0 } },
  currentFlashcard: null,
  gradeFlashcard: () => {},
});

interface FlashcardsDataProviderProps {
  children: React.ReactNode;
  topicId: string;
  initialFlashcardsData: TopicFlashcardsData;
}
export const FlashcardsDataProvider: FC<FlashcardsDataProviderProps> = ({ children, topicId, initialFlashcardsData }) => {
  const [flashcardsData, setFlashcardsData] = useState<TopicFlashcardsData>(initialFlashcardsData);
  
  // Recalculate current flashcard whenever flashcardsData changes
  const currentFlashcard = useMemo(() => getNextCard(flashcardsData) || null, [flashcardsData]);

  async function gradeFlashcard (flashcard: Flashcard, grade: Grade) {
    const { card, log } = fsrs.next(flashcard, new Date(), grade);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not found");
    }

    const { data: srCard, error: srCardError } = await supabase.from("sr_card").upsert({
        question_id: flashcard.question.id,
        stability: card.stability,
        difficulty: card.difficulty,
        learning_steps: card.learning_steps,
        reps: card.reps,
        scheduled_days: card.scheduled_days,
        elapsed_days: card.elapsed_days,
        lapses: card.lapses,
        state: card.state,
        due: card.due.toISOString(),
        last_review: card.last_review?.toISOString() || null,
      }).select().single();
      
    if (srCardError) {
      throw new Error(srCardError.message);
    }

    const belowThreshold = (flashcardsData.cards.new.length + flashcardsData.cards.review.length) <= Number(process.env.NEXT_PUBLIC_THRESHOLD_CARDS_FOR_REFETCH);

    const [{ error: srReviewLogError }, newFlashcardsData] = await Promise.all([
      supabase.from("sr_review_log").insert({
        ...log,
        card_id: srCard.id,
        due: log.due.toISOString(),
        review: log.review.toISOString(),
      }),
      belowThreshold ? getTopicFlashcardsData(supabase, user, topicId) : Promise.resolve(removeCardFromSessionData(flashcardsData, flashcard.question.id)),
    ]);

    if (srReviewLogError) {
      throw new Error(srReviewLogError.message);
    }

    setFlashcardsData(newFlashcardsData);
  }

  return (
    <FlashcardsContext.Provider value={{ flashcardsData, currentFlashcard, gradeFlashcard }}>
      {children}
    </FlashcardsContext.Provider>
  );
}