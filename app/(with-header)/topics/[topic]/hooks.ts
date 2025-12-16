import { useContext } from "react";
import { FlashcardsContext } from "./contexts";

export function useFlashcards() {
  const context = useContext(FlashcardsContext);

  if (!context) {
    throw new Error("useFlashcards must be used within a FlashcardsProvider");
  }

  return context;
}