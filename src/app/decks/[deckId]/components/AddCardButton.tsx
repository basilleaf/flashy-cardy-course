"use client";

import { Button } from "@/components/ui/button";
import { CardFormDialog } from "./CardFormDialog";

export function AddCardButton({ deckId }: { deckId: number }) {
  return (
    <CardFormDialog deckId={deckId}>
      <Button>Add Card</Button>
    </CardFormDialog>
  );
}
