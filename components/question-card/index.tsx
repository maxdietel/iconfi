import { QuestionCardShell } from "./question-card-shell";
import { MatchQuestionCard } from "./match-question-card";
import { MultipleChoiceQuestionCard } from "./multiple-choice-question-card";
import { OrderQuestionCard } from "./order-question-card";
import { SingleChoiceQuestionCard } from "./single-choice-question-card";
import { QuestionCardProps } from "./types";

export type { QuestionCardProps };

export function QuestionCard({ question, options, onRate }: QuestionCardProps) {
  switch (question.question_type) {
    case "single":
      return (
        <SingleChoiceQuestionCard
          question={question}
          options={options}
          onRate={onRate}
        />
      );
    case "multiple":
      return (
        <MultipleChoiceQuestionCard
          question={question}
          options={options}
          onRate={onRate}
        />
      );
    case "order":
      return <OrderQuestionCard question={question} options={options} onRate={onRate} />;
    case "match":
      return <MatchQuestionCard question={question} options={options} onRate={onRate} />;
    default:
      return (
        <QuestionCardShell question={question} isCorrect={null}>
          <div className="text-sm text-muted-foreground">
            Unsupported question type.
          </div>
        </QuestionCardShell>
      );
  }
}


