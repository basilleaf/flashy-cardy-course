"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateDeck } from "@/lib/db/queries/decks";

const updateDeckSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(5000),
});

type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

export async function updateDeckAction(deckId: number, input: UpdateDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = updateDeckSchema.parse(input);
  const trimmedDesc = validated.description.trim();

  const deck = await updateDeck(deckId, userId, {
    title: validated.title.trim(),
    description: trimmedDesc === "" ? null : trimmedDesc,
  });
  if (!deck) throw new Error("Deck not found");

  revalidatePath("/dashboard");
  revalidatePath(`/decks/${deckId}`);
  return deck;
}
