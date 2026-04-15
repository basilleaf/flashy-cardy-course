"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CardFormDialog } from "@/components/card-form-dialog";
import { deleteCardAction } from "@/app/actions/cards";

type CardData = {
  id: number;
  front: string;
  back: string;
};

type Props = {
  deckId: number;
  card: CardData;
};

export function CardItem({ deckId, card }: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteCardAction(deckId, card.id);
        setDeleteOpen(false);
        toast.success("Card deleted");
      } catch {
        toast.error("Could not delete card. Please try again.");
      }
    });
  }

  return (
    <Card className="hover:border-zinc-600 transition-colors group relative">
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <CardFormDialog deckId={deckId} card={card}>
          <Button variant="ghost" size="icon-sm" aria-label="Edit card">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </CardFormDialog>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete card"
                className="text-destructive hover:text-destructive"
              />
            }
          >
            <Trash2 className="h-3.5 w-3.5" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Card?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This will permanently delete this card. This action cannot be undone.
            </p>
            <DialogFooter showCloseButton>
              <Button
                variant="destructive"
                disabled={isPending}
                onClick={handleDelete}
              >
                {isPending ? "Deleting…" : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <CardHeader className="pb-2 pr-16">
        <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
          Front
        </CardTitle>
        <p className="text-base">{card.front}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-1">
          Back
        </p>
        <p className="text-base text-zinc-300">{card.back}</p>
      </CardContent>
    </Card>
  );
}
