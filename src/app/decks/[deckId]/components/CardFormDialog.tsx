"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCardAction, updateCardAction } from "@/app/actions/cards";

type CardData = {
  id: number;
  front: string;
  back: string;
};

type Props = {
  deckId: number;
  card?: CardData;
  children: React.ReactNode;
};

export function CardFormDialog({ deckId, card, children }: Props) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState(card?.front ?? "");
  const [back, setBack] = useState(card?.back ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEdit = !!card;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setFront(card?.front ?? "");
      setBack(card?.back ?? "");
      setError(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateCardAction(deckId, card.id, { front, back });
          toast.success("Card updated");
        } else {
          await createCardAction(deckId, { front, back });
          setFront("");
          setBack("");
          toast.success("Card added");
        }
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
            <DialogTitle>{isEdit ? "Edit Card" : "Add Card"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="front">Front</Label>
              <Textarea
                id="front"
                placeholder="Question or term"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows={3}
                required
                disabled={isPending}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="back">Back</Label>
              <Textarea
                id="back"
                placeholder="Answer or definition"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                rows={3}
                required
                disabled={isPending}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <DialogFooter showCloseButton>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? isEdit
                    ? "Saving…"
                    : "Adding…"
                  : isEdit
                    ? "Save Changes"
                    : "Add Card"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
