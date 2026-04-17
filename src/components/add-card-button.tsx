"use client";

import { Button } from "@/components/ui/button";
import { CardFormDialog } from "@/app/decks/[deckId]/components/CardFormDialog";
import React from "react";

export function AddCardButton({ deckId }: { deckId: number }) {
  return (
    <CardFormDialog deckId={deckId}>
      <Button>Add Card</Button>
    </CardFormDialog>
  );
}
