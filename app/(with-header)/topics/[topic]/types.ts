import { InsertSRCard, LearningMaterial, LearningMaterialPage, LearningMaterialTopic, Option, Question, TopicSRStats } from "@/lib/supabase/types";
import { Database } from "@/lib/supabase/database.types";
import {
  Card,
} from "ts-fsrs";

type ExternalResource = Pick<Database["public"]["Tables"]["learning_material_external_resource"]["Row"], "id" | "description" | "type" | "url">;

export interface Flashcard extends Omit<InsertSRCard, "due" | "last_review">, Card {
  question: Question & { 
    options: Option[], 
    learning_material_pages: (Pick<LearningMaterialPage, "id" | "key_concepts" | "number" | "title" | "description"> & { 
      learning_material_topic: Pick<LearningMaterialTopic, "id"> & { 
        learning_material: Pick<LearningMaterial, "id" | "url"> 
      },
      learning_material_external_resources: ExternalResource[]
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