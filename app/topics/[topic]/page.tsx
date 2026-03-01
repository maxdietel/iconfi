import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { FlashcardsDataProvider } from "./contexts";
import { getTopicFlashcardsData } from "./utils";
import { TopicPageClient } from "./client";

export default async function TopicFlashcardsPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: topicId } = await params;
  const supabase = await createClient();

  // Get user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect("/auth/login");
  }

  // Get topic
  // TODO: Change Topic.topic to Topic.name/title
  const { data: topic, error: topicError } = await supabase.from("topic").select("*").eq("id", topicId).eq("disabled", false).single();
  if (topicError || !topic) {
    console.error("Error fetching topic:", topicError);
    notFound();
  }

  const flashcardsData = await getTopicFlashcardsData(supabase, user, topicId);

  return (
    <FlashcardsDataProvider topicId={topicId} initialFlashcardsData={flashcardsData}>
      <TopicPageClient topic={topic.topic} />
    </FlashcardsDataProvider>
  );
}
