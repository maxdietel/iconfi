import { redirect, notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { QuestionCard } from "@/components/question-card";
import Link from "next/link";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: topicId } = await params;
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.getClaims();
  if (authError || !authData?.claims) {
    redirect("/auth/login");
  }

  // Fetch the topic
  const { data: topic, error: topicError } = await supabase
    .from("topic")
    .select("*")
    .eq("id", topicId)
    .single();

  if (topicError || !topic) {
    notFound();
  }

  // Fetch all examinations for this topic
  const { data: examinations, error: examinationsError } = await supabase
    .from("examination")
    .select("id")
    .eq("topic_id", topicId);

  if (examinationsError) {
    console.error("Error fetching examinations:", examinationsError);
  }

  // Fetch all questions for these examinations
  const examinationIds = examinations?.map((e) => e.id) || [];
  const { data: questions, error: questionsError } = examinationIds.length > 0
    ? await supabase
        .from("question")
        .select("*")
        .in("examination_id", examinationIds)
        .order("code", { ascending: true })
    : { data: null, error: null };

  if (questionsError) {
    console.error("Error fetching questions:", questionsError);
  }

  // Fetch all options for these questions
  const questionIds = questions?.map((q) => q.id) || [];
  const { data: options, error: optionsError } = questionIds.length > 0
    ? await supabase
        .from("option")
        .select("*")
        .in("question_id", questionIds)
        .order("created_at", { ascending: true })
    : { data: null, error: null };

  if (optionsError) {
    console.error("Error fetching options:", optionsError);
  }

  // Group options by question_id for easier access
  type Option = NonNullable<typeof options>[number];
  const optionsByQuestion = (options || []).reduce((acc, option: Option) => {
    if (!acc[option.question_id]) {
      acc[option.question_id] = [];
    }
    acc[option.question_id].push(option);
    return acc;
  }, {} as Record<string, Option[]>);

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <Link
          href="/topics"
          className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
        >
          ← Back to Topics
        </Link>
        <h1 className="font-bold text-3xl mb-2">{topic.topic}</h1>
        <p className="text-muted-foreground">
          All questions for this topic across all examinations.
        </p>
      </div>

      {questionsError ? (
        <div className="bg-destructive/10 text-destructive text-sm p-3 px-5 rounded-md">
          Error loading questions: {questionsError.message}
        </div>
      ) : questions && questions.length > 0 ? (
        <div className="flex flex-col gap-4">
          {questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              options={optionsByQuestion[question.id] || []}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No questions found for this topic.
        </div>
      )}
    </div>
  );
}
