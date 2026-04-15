import { db } from "@/lib/db/db";
import { decks } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function getDecksByUser(userId: string) {
  return db.select().from(decks).where(eq(decks.clerkUserId, userId));
}

export async function getDeckById(deckId: number, userId: string) {
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.clerkUserId, userId)));
  return deck ?? null;
}

export async function createDeck(
  userId: string,
  title: string,
  description?: string,
) {
  const [deck] = await db
    .insert(decks)
    .values({ clerkUserId: userId, title, description })
    .returning();
  return deck;
}

export async function updateDeck(
  deckId: number,
  userId: string,
  values: { title?: string; description?: string | null },
) {
  const [deck] = await db
    .update(decks)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(decks.id, deckId), eq(decks.clerkUserId, userId)))
    .returning();
  return deck ?? null;
}

export async function deleteDeck(deckId: number, userId: string) {
  await db
    .delete(decks)
    .where(and(eq(decks.id, deckId), eq(decks.clerkUserId, userId)));
}
