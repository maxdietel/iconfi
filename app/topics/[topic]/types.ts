import { InsertSRCard, LearningMaterial, LearningMaterialPage, LearningMaterialTopic, Option, Question, TopicSRStats } from "@/lib/supabase/types";
import {
  Card,
} from "ts-fsrs";

export interface Flashcard extends Omit<InsertSRCard, "due" | "last_review">, Card {
  question: Question & { 
    options: Option[], 
    learning_material_pages: (Pick<LearningMaterialPage, "id" | "key_concepts" | "number" | "title" | "description"> & { 
      learning_material_topic: Pick<LearningMaterialTopic, "id"> & { 
        learning_material: Pick<LearningMaterial, "id" | "url"> 
      } 
    })[] 
  };
}

export type TopicFlashcardsData = {
  cards: {
    new: Flashcard[];
    review: Flashcard[];
  },
  stats: TopicSRStats;
}