import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getDeckById } from "@/lib/db/queries/decks";
import { getCardsByDeck } from "@/lib/db/queries/cards";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { StudySession } from "./components/StudySession";

export default async function DeckStudyPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { deckId } = await params;
  const id = Number(deckId);
  if (isNaN(id)) notFound();

  const deck = await getDeckById(id, userId);
  if (!deck) notFound();

  const cards = await getCardsByDeck(id, userId);
  if (!cards) notFound();

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">
            Your Decks
          </Link>
          <span>/</span>
          <Link href={`/decks/${id}`} className="hover:text-zinc-300 transition-colors">
            {deck.title}
          </Link>
          <span>/</span>
          <span className="text-zinc-300">Study</span>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Study: {deck.title}</h1>
          <Link
            href={`/decks/${id}`}
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Manage Deck
          </Link>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-lg font-medium text-zinc-300">No cards to study yet</p>
          <p className="text-sm text-zinc-500 max-w-md">
            Add cards to this deck, then come back here to practice.
          </p>
          <Link href={`/decks/${id}`} className={cn(buttonVariants())}>
            Back to deck
          </Link>
        </div>
      ) : (
        <StudySession
          deckId={id}
          deckTitle={deck.title}
          cards={cards.map((c) => ({
            id: c.id,
            front: c.front,
            back: c.back,
          }))}
        />
      )}
    </main>
  );
}
