"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateDeckCardsWithAiAction } from "@/app/actions/generateDeckCardsWithAi";

type Props = {
  deckId: number;
  canUseAi: boolean;
  deckReadyForAi: boolean;
};

const METADATA_PROMPT =
  "Add a deck description in Edit Deck first. AI uses your title and description to create relevant cards.";

export function GenerateCardsWithAiButton({
  deckId,
  canUseAi,
  deckReadyForAi,
}: Props) {
  const [isPending, startTransition] = useTransition();

  if (!canUseAi) {
    return (
      <Tooltip>
        <TooltipTrigger className="inline-flex">
          <Link
            href="/pricing"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Generate cards with AI
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-pretty">
          AI card generation is a paid feature included with Pro. Click to open
          pricing and upgrade.
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!deckReadyForAi) {
    return (
      <Tooltip>
        <TooltipTrigger
          className="inline-flex"
          render={
            <Button
              type="button"
              variant="secondary"
              className="opacity-80"
              onClick={() => toast.info(METADATA_PROMPT)}
            >
              Generate cards with AI
            </Button>
          }
        />
        <TooltipContent side="bottom" className="max-w-xs text-pretty">
          {METADATA_PROMPT}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          try {
            const result = await generateDeckCardsWithAiAction(deckId);
            toast.success(
              `Added ${result.created} card${result.created !== 1 ? "s" : ""} from AI`,
            );
          } catch {
            toast.error("Could not generate cards. Try again in a moment.");
          }
        });
      }}
    >
      {isPending ? "Generating…" : "Generate cards with AI"}
    </Button>
  );
}
