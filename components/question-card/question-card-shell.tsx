import { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Question } from "@/lib/supabase/types";

type QuestionCardShellProps = {
  question: Question;
  isCorrect: boolean | null;
  children: ReactNode;
};

export function QuestionCardShell({
  question,
  isCorrect,
  children,
}: QuestionCardShellProps) {
  const borderClass =
    isCorrect === null
      ? ""
      : isCorrect
      ? "border-green-500 dark:border-green-400"
      : "border-red-500 dark:border-red-400";

  return (
    <Card className={`hover:shadow-lg transition-shadow ${borderClass}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">
              Question {question.code}
            </CardTitle>
            <CardDescription className="mb-2">
              Type: {question.question_type} | Topic: {question.topic}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {question.context ? (
            <div className="text-sm text-muted-foreground italic">
              {question.context}
            </div>
          ) : null}
          <div className="text-base">{question.question_text}</div>
          {question.options_title ? (
            <div className="text-sm font-semibold mt-2">
              {question.options_title}
            </div>
          ) : null}
          {question.options_prefix ? (
            <div className="text-sm text-muted-foreground">
              {question.options_prefix}
            </div>
          ) : null}
          {children}
        </div>
      </CardContent>
    </Card>
  );
}


