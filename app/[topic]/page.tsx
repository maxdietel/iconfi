import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Pool } from "./pool";
import { Stats } from "./stats";
import { FlashcardsDataProvider } from "./contexts";
import { getTopicFlashcardsData } from "./utils";
import Link from "next/link";

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
  const { data: topic, error: topicError } = await supabase.from("topic").select("*").eq("id", topicId).single();
  if (topicError || !topic) {
    console.error("Error fetching topic:", topicError);
    notFound();
  }

  const flashcardsData = await getTopicFlashcardsData(supabase, user, topicId);

  return (
    <FlashcardsDataProvider topicId={topicId} initialFlashcardsData={flashcardsData}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <Link
            href="/topics"
            className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
          >
            ← Alle Themen
          </Link>
          <h1 className="font-bold text-3xl mb-2">{topic.topic}</h1>
          <p className="text-muted-foreground">
            Lerne alle geschlossenen Wissenfragen zum Thema.
          </p>
        </div>
        
        <Stats />
        <Pool />
      </div>
    </FlashcardsDataProvider>
  );
}