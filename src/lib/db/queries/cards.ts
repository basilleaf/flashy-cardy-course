import { db } from "@/lib/db/db";
import { cards, decks } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

async function verifyDeckOwnership(deckId: number, userId: string) {
  const [deck] = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.clerkUserId, userId)));
  return deck ?? null;
}

export async function getCardsByDeck(deckId: number, userId: string) {
  const deck = await verifyDeckOwnership(deckId, userId);
  if (!deck) return null;

  return db.select().from(cards).where(eq(cards.deckId, deckId));
}

export async function getCardById(cardId: number, userId: string) {
  const [result] = await db
    .select({ card: cards })
    .from(cards)
    .innerJoin(decks, and(eq(cards.deckId, decks.id), eq(decks.clerkUserId, userId)))
    .where(eq(cards.id, cardId));
  return result?.card ?? null;
}

export async function createCard(
  deckId: number,
  userId: string,
  front: string,
  back: string,
) {
  const deck = await verifyDeckOwnership(deckId, userId);
  if (!deck) return null;

  const [card] = await db
    .insert(cards)
    .values({ deckId, front, back })
    .returning();
  return card;
}

export async function updateCard(
  cardId: number,
  userId: string,
  values: { front?: string; back?: string },
) {
  const [result] = await db
    .update(cards)
    .set({ ...values, updatedAt: new Date() })
    .from(decks)
    .where(
      and(
        eq(cards.id, cardId),
        eq(cards.deckId, decks.id),
        eq(decks.clerkUserId, userId),
      ),
    )
    .returning({ card: cards });
  return result?.card ?? null;
}

export async function deleteCard(cardId: number, userId: string) {
  const card = await getCardById(cardId, userId);
  if (!card) return;

  await db.delete(cards).where(eq(cards.id, cardId));
}
