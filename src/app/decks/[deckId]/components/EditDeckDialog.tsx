"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
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
import { updateDeckAction } from "@/app/actions/decks";

type Props = {
  deckId: number;
  title: string;
  description: string | null;
  children: React.ReactNode;
};

export function EditDeckDialog({
  deckId,
  title: initialTitle,
  description: initialDescription,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      setTitle(initialTitle);
      setDescription(initialDescription ?? "");
    }
  }, [open, initialTitle, initialDescription]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await updateDeckAction(deckId, { title, description });
        setOpen(false);
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <>
      <span className="contents" onClick={() => setOpen(true)}>
        {children}
      </span>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Deck</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="deck-title">Title</Label>
              <Input
                id="deck-title"
                placeholder="Deck name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={255}
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="deck-description">Description</Label>
              <Textarea
                id="deck-description"
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
              <Link
                href={`/decks/${deckId}`}
                className={cn(buttonVariants({ variant: "outline" }))}
                onClick={() => setOpen(false)}
              >
                Manage deck
              </Link>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
