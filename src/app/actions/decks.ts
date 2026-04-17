"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createDeck, deleteDeck, updateDeck } from "@/lib/db/queries/decks";

const deckFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(5000),
});

type CreateDeckInput = z.infer<typeof deckFormSchema>;
type UpdateDeckInput = z.infer<typeof deckFormSchema>;

export async function createDeckAction(input: CreateDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = deckFormSchema.parse(input);
  const trimmedDesc = validated.description.trim();

  const deck = await createDeck(
    userId,
    validated.title.trim(),
    trimmedDesc === "" ? null : trimmedDesc,
  );

  revalidatePath("/dashboard");
  return deck;
}

export async function updateDeckAction(deckId: number, input: UpdateDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = deckFormSchema.parse(input);
  const trimmedDesc = validated.description.trim();

  const deck = await updateDeck(deckId, userId, {
    title: validated.title.trim(),
    description: trimmedDesc === "" ? null : trimmedDesc,
  });
  if (!deck) throw new Error("Deck not found");

  revalidatePath("/dashboard");
  revalidatePath(`/decks/${deckId}`);
  revalidatePath(`/study/${deckId}`);
  return deck;
}

export async function deleteDeckAction(deckId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const deleted = await deleteDeck(deckId, userId);
  if (!deleted) throw new Error("Deck not found");

  revalidatePath("/dashboard");
  revalidatePath(`/decks/${deckId}`);
  revalidatePath(`/study/${deckId}`);
}
