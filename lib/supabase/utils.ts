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

export async function getLearningDueCount(
  supabase: SupabaseClient,
  user: User,
  topicId: string,
): Promise<number> {
  const { count: learningDueCount, error: learningDueError } = await supabase
    .from("sr_card")
    .select(`id, question ( examination ( topic_id ) )`, { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("question.examination.topic_id", topicId)
    .lte("due", new Date().toISOString())
    .in("state", [1, 3]);

  if (learningDueError) {
    throw new Error(`Failed to fetch learning stats: ${learningDueError.message}`);
  }

  return learningDueCount as number;
}

export async function getReviewDueCount(
  supabase: SupabaseClient,
  user: User,
  topicId: string,
): Promise<number> {
  const { count: reviewDueCount, error: reviewDueError } = await supabase
    .from("sr_card")
    .select(`id, question ( examination ( topic_id ) )`, { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("question.examination.topic_id", topicId)
    .lte("due", new Date().toISOString())
    .eq("state", 2);

  if (reviewDueError) {
    throw new Error(`Failed to fetch review stats: ${reviewDueError.message}`);
  }

  return reviewDueCount as number;
}

export async function getNewCount(
  supabase: SupabaseClient,
  user: User,
  topicId: string,
): Promise<number> {
    // Get all existing cards for this user and topic
    const { data: srCards, error: srCardsError } = await supabase
    .from("sr_card")
    .select(`question_id, question ( examination ( topic_id ) )`)
    .eq("user_id", user.id)
    .eq("question.examination.topic_id", topicId);

  if (srCardsError) {
    throw new Error(`Failed to fetch existing cards: ${srCardsError.message}`);
  }

  const existingQuestionIds = srCards?.map((card) => card.question_id) ?? [];

  const { count: newCount, error: newError } = await supabase
    .from("question")
    .select(`id, examination ( topic_id )`, { count: "exact", head: true })
    .eq("examination.topic_id", topicId)
    .not("id", "in", `(${existingQuestionIds.join(",")})`)

  if (newError) {
    throw new Error(`Failed to fetch new count: ${newError.message}`);
  }

  return newCount as number;
}

export async function getTotalCount(
  supabase: SupabaseClient,
  topicId: string,
): Promise<number> {
  const { count: totalCount, error: totalError } = await supabase
    .from("question")
    .select(`id, examination ( topic_id )`, { count: "exact", head: true })
    .eq("examination.topic_id", topicId)

  if (totalError) {
    throw new Error(`Failed to fetch total count: ${totalError.message}`);
  }

  return totalCount as number;
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

  const [totalCount, learningDueCount, reviewDueCount, newDueCount] = await Promise.all([
    getTotalCount(supabase, topicId), // This is the total number of questions for this topic
    getLearningDueCount(supabase, user, topicId), // This is the number of learning cards due for this user and topic
    getReviewDueCount(supabase, user, topicId), // This is the number of review cards due for this user and topic
    getNewCount(supabase, user, topicId), // This is the number of new cards that can still be learned today for this user and topic
  ]);

  console.log({
    numLeftToLearn,
    totalCount,
    learningDueCount,
    reviewDueCount,
    newDueCount,
  });

  const newCountWithLimit = Math.min(numLeftToLearn, newDueCount);
  const totalDueCount = learningDueCount + reviewDueCount + newCountWithLimit;

  const stats: TopicSRStats = {
    total: totalCount,
    totalDue: totalDueCount,
    newDue: newDueCount,
    learningDue: learningDueCount,
    reviewDue: reviewDueCount,
  };

  console.log(`Fetched stats: ${JSON.stringify(stats)}`);
  return stats;
}