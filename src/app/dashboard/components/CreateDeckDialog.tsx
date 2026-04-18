"use client";

import { cloneElement, isValidElement, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createDeckAction } from "@/app/actions/decks";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  /** When false, creation is blocked (e.g. free plan deck limit). */
  canCreateDeck?: boolean;
};

export function CreateDeckDialog({
  children,
  canCreateDeck = true,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setError(null);
      setTitle("");
      setDescription("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const deck = await createDeckAction({ title, description });
        setOpen(false);
        setTitle("");
        setDescription("");
        router.push(`/decks/${deck.id}`);
      } catch (err) {
        if (err instanceof Error && err.message === "DECK_LIMIT_REACHED") {
          setError(
            "You've reached the free plan deck limit. Upgrade to create more.",
          );
        } else {
          setError("Something went wrong. Please try again.");
        }
      }
    });
  }

  const trigger = canCreateDeck ? (
    <span className="contents" onClick={() => setOpen(true)}>
      {children}
    </span>
  ) : (
    <span className="inline-flex flex-wrap items-center justify-end gap-2">
      {isValidElement(children)
        ? cloneElement(children, { disabled: true } as Record<string, unknown>)
        : children}
      <Link
        href="/pricing"
        className={cn(
          buttonVariants({ variant: "link", size: "sm" }),
          "h-auto px-0 text-zinc-300 underline-offset-4 hover:text-zinc-100",
        )}
      >
        Upgrade
      </Link>
    </span>
  );

  return (
    <>
      {trigger}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Deck</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-deck-title">Title</Label>
              <Input
                id="new-deck-title"
                placeholder="Deck name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={255}
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="new-deck-description">Description</Label>
              <Textarea
                id="new-deck-description"
                placeholder="Optional notes about this deck"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={5000}
                disabled={isPending}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <DialogFooter showCloseButton>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating…" : "Create Deck"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
