import { Database } from "./database.types";
import {
  Card,
} from "ts-fsrs";

type Question = Database["public"]["Tables"]["question"]["Row"];
type Option = Database["public"]["Tables"]["option"]["Row"];
type LearningMaterialPage = Database["public"]["Tables"]["learning_material_page"]["Row"];
type LearningMaterialTopic = Database["public"]["Tables"]["learning_material_topic"]["Row"];
type LearningMaterial = Database["public"]["Tables"]["learning_material"]["Row"];
type SRCard = Omit<Database["public"]["Tables"]["sr_card"]["Row"], "state"> & {
  state: Card["state"];
}
export type InsertSRCard = Omit<Database["public"]["Tables"]["sr_card"]["Insert"], "state"> & {
  state: Card["state"];
}

export type Topic = Database["public"]["Tables"]["topic"]["Row"];

export interface TopicSRStats {
  total: number;
  totalDue: number;
  newDue: number;
  learningDue: number;
  reviewDue: number;
}

export type { Question, Option, LearningMaterialPage, LearningMaterialTopic, LearningMaterial, SRCard };