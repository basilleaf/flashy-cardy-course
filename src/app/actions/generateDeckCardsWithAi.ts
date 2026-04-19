"use server";

import { auth } from "@clerk/nextjs/server";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createCard } from "@/lib/db/queries/cards";
import { getDeckById } from "@/lib/db/queries/decks";

const CARD_COUNT = 20;

/**
 * Anthropic structured output JSON schema is strict: arrays cannot use `maxItems`, and
 * `minItems` must be 0 or 1 (so no `.length(n)`). Enforce the batch size in code below.
 */
const aiFlashcardsOutputSchema = z.object({
  cards: z
    .array(
      z.object({
        front: z.string().min(1).max(1000),
        back: z.string().min(1).max(1000),
      }),
    )
    .min(1),
});

const FLASHCARD_MODEL =
  process.env.ANTHROPIC_FLASHCARD_MODEL ?? "claude-sonnet-4-6";

export async function generateDeckCardsWithAiAction(deckId: number) {
  const { userId, has } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (
    !has({ feature: "ai_flashcard_generation" }) &&
    !has({ plan: "pro" })
  ) {
    throw new Error("AI flashcard generation is not available on your plan");
  }

  const deck = await getDeckById(deckId, userId);
  if (!deck) throw new Error("Deck not found");

  const titleTrimmed = deck.title.trim();
  const descriptionTrimmed = deck.description?.trim() ?? "";
  if (!titleTrimmed || !descriptionTrimmed) {
    throw new Error(
      "Add a title and description to your deck before generating cards with AI.",
    );
  }

  const descriptionBlock = `Deck description:\n${descriptionTrimmed}`;

  const { output } = await generateText({
    model: anthropic(FLASHCARD_MODEL),
    output: Output.object({
      schema: aiFlashcardsOutputSchema,
      name: "flashcard_batch",
      description: `Exactly ${CARD_COUNT} flashcards with front and back strings.`,
    }),
    prompt: `You are creating study flashcards for a spaced-repetition deck.

Deck title: ${titleTrimmed}

${descriptionBlock}

Generate exactly ${CARD_COUNT} distinct flashcards that match this deck's topic and level. Each card must have:
- front: a short question, term, or prompt (what the learner sees first)
- back: the answer or concise explanation

Avoid duplicate fronts. Keep both sides within a typical study-card length.`,
  });

  if (!output) {
    throw new Error("The model did not return flashcards");
  }

  const cards = output.cards.slice(0, CARD_COUNT);
  if (cards.length < CARD_COUNT) {
    throw new Error(
      `The model returned ${output.cards.length} flashcards but ${CARD_COUNT} were required. Try again.`,
    );
  }

  for (const card of cards) {
    await createCard(deckId, userId, card.front, card.back);
  }

  revalidatePath(`/decks/${deckId}`);
  revalidatePath(`/study/${deckId}`);

  return { created: cards.length };
}
