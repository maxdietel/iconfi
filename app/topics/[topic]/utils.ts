import { SupabaseClient, User } from "@supabase/supabase-js";
import { createEmptyCard, State } from "ts-fsrs";
import { getNumberLeftToLearnTodayByTopic, getStatsByTopic } from "@/lib/supabase/utils";
import { Flashcard, TopicFlashcardsData } from "./types";
import { Database } from "@/lib/supabase/database.types";

/**
 * Retrieves cards that are due for review.
 * Filters out cards in learning state (state = 0) and returns cards that are due.
 */
export async function getReviewFlashcardsByTopic(
  supabase: SupabaseClient<Database>,
  user: User,
  topicId: string,
): Promise<Flashcard[]> {
  console.log("Fetching review cards");
  // Query sr_card with question and options joined
  // Filter by: user_id, state != 0 (not learning), due <= now
  // Order by difficulty ascending, limit results
  const { data: cardWithContents, error } = await supabase
    .from("sr_card")
    .select(
      `*, question ( *, options:option ( * ), examination ( topic_id ), learning_material_pages:learning_material_page ( id, key_concepts, number, title, description, learning_material_topic ( id, learning_material ( id, url ) ) ) )`,
    )
    .eq("user_id", user.id)
    .eq("question.examination.topic_id", topicId)
    .neq("state", 0) // Filter out cards in learning state (state = 0)
    .lte("due", new Date().toISOString())
    .order("difficulty", { ascending: true })
    .limit(Number(process.env.NEXT_PUBLIC_MAX_CARDS_TO_FETCH));

  if (error) {
    throw new Error(`Failed to fetch review cards: ${error.message}`);
  }

  // Transform the data to match Flashcard type
  // Convert date strings to Date objects
  const reviewFlashcards = cardWithContents?.map((card) => ({
    ...card,
    due: new Date(card.due),
    last_review: card.last_review ? new Date(card.last_review) : undefined,
  }));

  console.log(`Fetched ${reviewFlashcards.length} review cards`);
  return reviewFlashcards;
}

/**
 * Retrieves the new cards that can be learned today.
 *
 * New cards have a state of "New" and a difficulty of "0",
 * so we have to spread them out amongst the reviews.
 */
export async function getNewFlashcardsByTopic(
  supabase: SupabaseClient,
  user: User,
  topicId: string,
  numLeftToLearn: number,
): Promise<Flashcard[]> {
  if (numLeftToLearn <= 0) {
    return [];
  }

  // Since we won't ever have new flashcards in the database because we only write on first review, we will instead fetch new questions that do not have an associated flashcard yet.
  console.log("Fetching new cards");
  // In case the user can learn more cards than the limit cards to fetch
  const limit = Math.min(numLeftToLearn, Number(process.env.NEXT_PUBLIC_MAX_CARDS_TO_FETCH));

  console.log(`User can still learn ${numLeftToLearn} cards today`);

  // Step 1: Get all question_ids the user already has flashcards for
  const { data: srCards, error: srCardsError } = await supabase
  .from("sr_card")
  .select(`question_id, question ( examination ( topic_id ) )`)
  .eq('user_id', user.id)
  .eq("question.examination.topic_id", topicId);

  if (srCardsError) throw srCardsError;

  // Extract question_ids into an array
  const existingIds = srCards.map(f => f.question_id);

  // Step 2: Fetch all questions *not* in that list
  const { data: questionsWithContents, error: questionsWithContentsError } = await supabase
  .from("question")
  .select(`*, options:option ( * ), examination ( topic_id ), learning_material_pages:learning_material_page ( id, key_concepts, number, title, description, learning_material_topic ( id, learning_material ( id, url ) ) )`)
  .not("id", "in", `(${existingIds.join(",")})`)
  .eq("examination.topic_id", topicId)
  .limit(limit);

  if (questionsWithContentsError) throw questionsWithContentsError;

  const newFlashcards = questionsWithContents.map((question) => {
    const card = createEmptyCard(new Date());
    return {
      ...card,
      question,
      question_id: question.id,
    };
  });

  console.log(`Fetched ${newFlashcards.length} new flashcards`);

  return newFlashcards;
}

export async function getTopicFlashcardsData(
  supabase: SupabaseClient,
  user: User,
  topicId: string,
): Promise<TopicFlashcardsData> {
  const numLeftToLearn = await getNumberLeftToLearnTodayByTopic(supabase,user, topicId);

  const [reviewCards, newCards, stats] = await Promise.all([
    getReviewFlashcardsByTopic(supabase, user, topicId),
    getNewFlashcardsByTopic(supabase, user, topicId, numLeftToLearn),
    getStatsByTopic(supabase, user, topicId, numLeftToLearn),
  ]);

  return { cards: { new: newCards, review: reviewCards }, stats };
}

/**
 * Finds a card in the session data by its question ID.
 */
function getSessionCard(
  data: TopicFlashcardsData,
  questionId: string,
): Flashcard | null {
  // Check new cards first
  const newCard = data.cards.new.find(
    (card) => card.question.id === questionId,
  );
  if (newCard) {
    return newCard;
  }

  // Check review cards
  const reviewCard = data.cards.review.find(
    (card) => card.question.id === questionId,
  );
  if (reviewCard) {
    return reviewCard;
  }

  return null;
}

/**
 * Computes the next session data after grading a card.
 *
 * If the card's state is `New`, then the card exists in `newCards`.
 * If the card is any other state, then the card exists in `reviewCards`.
 *
 * @param data The current session data
 * @param questionId The id of the question that was graded
 */
export function removeCardFromSessionData(
  data: TopicFlashcardsData,
  questionId: string,
): TopicFlashcardsData {
  // In this implementation, we only show cards that are past the due date.
  // As such, we can assume that we won't see the card again in the current deck.
  const card = getSessionCard(data, questionId);
  if (!card) {
    return data;
  }

  // Create new arrays without the card
  let newCards = data.cards.new;
  let reviewCards = data.cards.review;

  if (card.state === State.New) {
    newCards = data.cards.new.filter(
      (c) => c.question.id !== questionId,
    );
  } else {
    reviewCards = data.cards.review.filter(
      (c) => c.question.id !== questionId,
    );
  }

  // Update stats
  const stats = { ...data.stats };
  
  if (card.state === State.New) {
    stats.new--;
  } else if (card.state === State.Learning || card.state === State.Relearning) {
    stats.learning--;
  } else if (card.state === State.Review) {
    stats.review--;
  }

  stats.total--;

  return {
    cards: {
      new: newCards,
      review: reviewCards,
    },
    stats,
  };
}