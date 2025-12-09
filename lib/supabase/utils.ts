import { SupabaseClient, User } from "@supabase/supabase-js";
import { TopicSRStats } from "./types";

/**
 * Retrieves the number of cards left to learn today.
 * Each day, we set a limit to the number of new cards that can be learned.
 */
export async function getNumberLeftToLearnTodayByTopic(
  supabase: SupabaseClient,
  user: User,
  topicId: string,
): Promise<number> {
  // Count distinct cards that have been learned today (state = 0)
  // We need to count distinct card_id values where state = 0 and created_at <= now
  // Since Supabase doesn't support distinct count directly, we fetch distinct card_ids and count them
  const { data, error } = await supabase
    .from("sr_review_log")
    .select(`card_id, sr_card ( question ( examination ( topic_id ) ) )`)
    .eq("user_id", user.id)
    .eq("sr_card.question.examination.topic_id", topicId)
    .eq("state", 0)
    .lte("created_at", new Date().toISOString());

  if (error) {
    throw new Error(
      `Failed to get the number of cards learned today: ${error.message}`,
    );
  }

  // Count distinct card_ids
  const distinctCardIds = new Set(data?.map((log) => log.card_id) ?? []);
  const numLearnToday = distinctCardIds.size;

  if (typeof numLearnToday !== "number") {
    throw new Error("Failed to get the number of cards learned today");
  }

  const numLeft = Number(process.env.NEXT_PUBLIC_MAX_LEARN_PER_DAY) - numLearnToday;

  // Assertion to catch for any bugs
  if (numLeft < 0) {
    throw new Error(
      "Number of cards learned today is more than the limit",
    );
  }

  return numLeft;
}

/**
 * Retrieves statistics about cards due for review/learning.
 * Note that new cards are not actually in the database - they're questions without cards yet.
 */
export async function getStatsByTopic(
  supabase: SupabaseClient,
  user: User,
  topicId: string,
  numLeftToLearn: number,
): Promise<TopicSRStats> {
  console.log("Fetching stats");

  // Get all cards due for this user and topic
  // We'll count them by state in separate queries since Supabase doesn't support CASE statements directly
  
  // Get total count
  const { count: totalWithoutNew, error: totalWithoutNewError } = await supabase
    .from("sr_card")
    .select(`id, question ( examination ( topic_id ) )`, { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("question.examination.topic_id", topicId)
    .lte("due", new Date().toISOString());

  if (totalWithoutNewError) {
    throw new Error(`Failed to fetch stats: ${totalWithoutNewError.message}`);
  }

  // Get learning count (state = 1 Learning OR state = 3 Relearning)
  const { count: learning, error: learningError } = await supabase
    .from("sr_card")
    .select(`id, question ( examination ( topic_id ) )`, { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("question.examination.topic_id", topicId)
    .lte("due", new Date().toISOString())
    .in("state", [1, 3]);

  if (learningError) {
    throw new Error(`Failed to fetch learning stats: ${learningError.message}`);
  }

  // Get review count (state = 2 Review)
  const { count: review, error: reviewError } = await supabase
    .from("sr_card")
    .select(`id, question ( examination ( topic_id ) )`, { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("question.examination.topic_id", topicId)
    .lte("due", new Date().toISOString())
    .eq("state", 2);

  if (reviewError) {
    throw new Error(`Failed to fetch review stats: ${reviewError.message}`);
  }

  // Count new cards - these are questions without cards yet
  // Similar to getNewFlashcardsByTopic but we just need the count
  const { data: srCards, error: srCardsError } = await supabase
    .from("sr_card")
    .select(`question_id, question ( examination ( topic_id ) )`)
    .eq("user_id", user.id)
    .eq("question.examination.topic_id", topicId);

  if (srCardsError) {
    throw new Error(`Failed to fetch existing cards: ${srCardsError.message}`);
  }

  const existingQuestionIds = srCards?.map((card) => card.question_id) ?? [];

  // Count questions for this topic that don't have cards yet
  const { count: newCount, error: newError } = await supabase
    .from("question")
    .select(`id, examination ( topic_id )`, { count: "exact", head: true })
    .eq("examination.topic_id", topicId)
    .not("id", "in", `(${existingQuestionIds.join(",")})`);

  if (newError) {
    throw new Error(`Failed to fetch new stats: ${newError.message}`);
  }

  const newCountWithLimit = Math.min(numLeftToLearn, newCount ?? 0);
  const total = (totalWithoutNew ?? 0) + newCountWithLimit;

  const stats: TopicSRStats = {
    total,
    new: newCountWithLimit,
    learning: learning ?? 0,
    review: review ?? 0,
  };

  console.log(`Fetched stats: ${JSON.stringify(stats)}`);
  return stats;
}