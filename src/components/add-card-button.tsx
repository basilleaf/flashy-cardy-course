"use client";

import { Button } from "@/components/ui/button";
import { CardFormDialog } from "@/components/card-form-dialog";

export function AddCardButton({ deckId }: { deckId: number }) {
  return (
    <CardFormDialog deckId={deckId}>
      <Button>Add Card</Button>
    </CardFormDialog>
  );
}
