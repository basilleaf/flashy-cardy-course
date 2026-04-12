"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createCard, updateCard, deleteCard } from "@/lib/db/queries/cards";

const cardSchema = z.object({
  front: z.string().min(1, "Front is required").max(1000),
  back: z.string().min(1, "Back is required").max(1000),
});

const cardIdSchema = z.object({
  cardId: z.number().int().positive(),
});

type CardInput = z.infer<typeof cardSchema>;

export async function createCardAction(deckId: number, input: CardInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = cardSchema.parse(input);
  const card = await createCard(deckId, userId, validated.front, validated.back);
  if (!card) throw new Error("Deck not found");

  revalidatePath(`/decks/${deckId}`);
  return card;
}

export async function updateCardAction(
  deckId: number,
  cardId: number,
  input: Partial<CardInput>,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { cardId: validatedCardId } = cardIdSchema.parse({ cardId });
  const validated = cardSchema.partial().parse(input);

  const card = await updateCard(validatedCardId, userId, validated);
  if (!card) throw new Error("Card not found");

  revalidatePath(`/decks/${deckId}`);
  return card;
}

export async function deleteCardAction(deckId: number, cardId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const { cardId: validatedCardId } = cardIdSchema.parse({ cardId });
  await deleteCard(validatedCardId, userId);

  revalidatePath(`/decks/${deckId}`);
}
