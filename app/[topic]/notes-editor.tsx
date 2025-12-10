"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useFlashcards } from "./hooks";

export function NotesEditor() {
  const { currentFlashcard, updateNotes } = useFlashcards();
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when flashcard changes
  useEffect(() => {
    if (currentFlashcard) {
      // Use the notes from the flashcard, defaulting to empty string if null/undefined
      const flashcardNotes = currentFlashcard.notes ?? "";
      setNotes(flashcardNotes);
    } else {
      setNotes("");
    }
  }, [currentFlashcard]);

  const handleSave = async () => {
    if (!currentFlashcard) return;

    setIsSaving(true);
    try {
      await updateNotes(currentFlashcard, notes);
    } catch (error) {
      console.error("Failed to save notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentFlashcard) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      <label className="text-sm font-semibold">Notizen</label>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Füge hier deine persönlichen Notizen hinzu..."
        rows={4}
      />
      <Button
        onClick={handleSave}
        disabled={isSaving}
        variant="outline"
        className="self-start"
      >
        {isSaving ? "Wird gespeichert..." : "Notizen speichern"}
      </Button>
    </div>
  );
}

