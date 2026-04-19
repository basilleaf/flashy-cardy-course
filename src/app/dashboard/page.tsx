import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getDecksByUser } from "@/lib/db/queries/decks";
import { FREE_PLAN_DECK_LIMIT } from "@/lib/deck-limits";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditDeckDialog } from "@/app/decks/[deckId]/components/EditDeckDialog";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { CreateDeckDialog } from "./components/CreateDeckDialog";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId, has } = await auth();
  if (!userId) redirect("/");

  const userDecks = await getDecksByUser(userId);
  const canCreateDeck =
    has({ feature: "unlimited_decks" }) ||
    userDecks.length < FREE_PLAN_DECK_LIMIT;

  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Decks</h1>
          <p className="text-zinc-400 mt-1">Manage and study your flashcard decks</p>
          {!canCreateDeck && (
            <p className="text-sm text-amber-500/90 mt-2 max-w-md">
              Free plan includes up to {FREE_PLAN_DECK_LIMIT} decks. Upgrade to add
              more.
            </p>
          )}
        </div>
        <CreateDeckDialog canCreateDeck={canCreateDeck}>
          <Button>New Deck</Button>
        </CreateDeckDialog>
      </div>

      {userDecks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-lg font-medium text-zinc-300">No decks yet</p>
          <p className="text-sm text-zinc-500">Create your first deck to get started</p>
          <CreateDeckDialog canCreateDeck={canCreateDeck}>
            <Button>Create a Deck</Button>
          </CreateDeckDialog>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userDecks.map((deck) => (
            <Card
              key={deck.id}
              className="flex h-full flex-col transition-colors hover:border-zinc-600"
            >
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link
                    href={`/decks/${deck.id}`}
                    className="font-semibold text-zinc-100 transition-colors hover:text-zinc-50"
                  >
                    {deck.title}
                  </Link>
                </CardTitle>
                {deck.description && (
                  <CardDescription>{deck.description}</CardDescription>
                )}
                <CardAction>
                  <EditDeckDialog
                    deckId={deck.id}
                    title={deck.title}
                    description={deck.description}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-zinc-400 hover:text-zinc-100"
                      aria-label="Edit deck"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </EditDeckDialog>
                </CardAction>
              </CardHeader>
              <CardContent className="mt-auto flex flex-col gap-4">
                <p className="text-xs text-zinc-500">
                  Updated {new Date(deck.updatedAt).toLocaleDateString()}
                </p>
                <Link
                  href={`/study/${deck.id}`}
                  className={cn(buttonVariants(), "w-full")}
                >
                  Start study
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
