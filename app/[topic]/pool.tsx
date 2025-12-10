"use client";

import {
  Grade,
} from "ts-fsrs";
import { FC } from "react";
import { SingleChoiceQuestionCard } from "@/components/question-card/single-choice-question-card";
import { MultipleChoiceQuestionCard } from "@/components/question-card/multiple-choice-question-card";
import { OrderQuestionCard } from "@/components/question-card/order-question-card";
import { MatchQuestionCard } from "@/components/question-card/match-question-card";
import { RelatedPagesCard } from "./related-pages-card";
import { NotesEditor } from "./notes-editor";
import { useFlashcards } from "./hooks";

export const Pool: FC = () => {
  const { currentFlashcard, gradeFlashcard } = useFlashcards();

  const handleRate = (rating: Grade) => {
    if (currentFlashcard) {
      gradeFlashcard(currentFlashcard, rating);
    }
  };

  return (
    <>
      <div>
        {(() => {
          switch (currentFlashcard?.question.question_type) {
            case "single":
              return <SingleChoiceQuestionCard question={currentFlashcard.question} options={currentFlashcard.question.options} onRate={handleRate} />;
            case "multiple":
              return <MultipleChoiceQuestionCard question={currentFlashcard.question} options={currentFlashcard.question.options} onRate={handleRate} />;
            case "order":
              return <OrderQuestionCard question={currentFlashcard.question} options={currentFlashcard.question.options} onRate={handleRate} />;
            case "match":
              return <MatchQuestionCard question={currentFlashcard.question} options={currentFlashcard.question.options} onRate={handleRate} />;
            default:
              return <div>Sehr gut! Erstmal keine Fragen mehr zum Thema. Mache eine Pause und schaue später oder morgen wieder vorbei.</div>;
          }
        })()}
      </div>
      {currentFlashcard && <NotesEditor />}
      {currentFlashcard?.question.learning_material_pages && (
        <RelatedPagesCard pages={currentFlashcard.question.learning_material_pages} />
      )}
    </>
  );
}