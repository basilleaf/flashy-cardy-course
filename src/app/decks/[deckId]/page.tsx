import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getDeckById } from "@/lib/db/queries/decks";
import { getCardsByDeck } from "@/lib/db/queries/cards";
import { Button } from "@/components/ui/button";
import { AddCardButton } from "./components/AddCardButton";
import { CardItem } from "./components/CardItem";
import { EditDeckDialog } from "./components/EditDeckDialog";

export default async function DeckPage({
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

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-8 max-w-5xl mx-auto w-full">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">
              Your Decks
            </Link>
            <span>/</span>
            <span className="text-zinc-300">{deck.title}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{deck.title}</h1>
          {deck.description && (
            <p className="text-zinc-400 mt-1">{deck.description}</p>
          )}
          <p className="text-xs text-zinc-600 mt-1">
            {cards?.length ?? 0} card{cards?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <EditDeckDialog
            deckId={id}
            title={deck.title}
            description={deck.description}
          >
            <Button variant="outline">Edit Deck</Button>
          </EditDeckDialog>
          <AddCardButton deckId={id} />
        </div>
      </div>

      {!cards || cards.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-lg font-medium text-zinc-300">No cards yet</p>
          <p className="text-sm text-zinc-500">
            Add your first card to start studying
          </p>
          <AddCardButton deckId={id} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <CardItem key={card.id} deckId={id} card={card} />
          ))}
        </div>
      )}
    </main>
  );
}
