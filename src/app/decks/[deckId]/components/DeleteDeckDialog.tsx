"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteDeckAction } from "@/app/actions/decks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  deckId: number;
  title: string;
  cardCount: number;
  children: React.ReactNode;
};

export function DeleteDeckDialog({
  deckId,
  title,
  cardCount,
  children,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setError(null);
  }

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteDeckAction(deckId);
        setOpen(false);
        router.push("/dashboard");
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
            <DialogTitle>Delete deck?</DialogTitle>
            <DialogDescription>
              <span className="block">
                This will permanently delete{" "}
                <span className="font-medium text-foreground">{title}</span>
                {cardCount > 0 ? (
                  <>
                    {" "}
                    and all {cardCount} card{cardCount !== 1 ? "s" : ""} in it
                  </>
                ) : null}
                . This cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending ? "Deleting…" : "Delete deck"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
