import type { Option, Question } from "@/lib/supabase/types";
import type { Grade } from "ts-fsrs";

export type QuestionCardProps = {
  question: Question;
  options: Option[];
  onRate?: (rating: Grade) => void;
};