"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export type StudyCard = {
  id: number;
  front: string;
  back: string;
};

type Props = {
  deckId: number;
  deckTitle: string;
  cards: StudyCard[];
};

function shuffleCards(list: StudyCard[]): StudyCard[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

export function StudySession({ deckId, deckTitle, cards }: Props) {
  const [orderedCards, setOrderedCards] = useState(() => [...cards]);
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [completeOpen, setCompleteOpen] = useState(false);

  const total = orderedCards.length;
  const current = orderedCards[index]!;
  const graded = correctCount + incorrectCount;
  const accuracyPct =
    graded > 0 ? Math.round((correctCount / graded) * 100) : 0;

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : total - 1));
    setShowBack(false);
  }, [total]);

  const goNext = useCallback(() => {
    setIndex((i) => (i < total - 1 ? i + 1 : 0));
    setShowBack(false);
  }, [total]);

  const handleShuffle = useCallback(() => {
    setOrderedCards(shuffleCards(cards));
    setIndex(0);
    setShowBack(false);
    setCorrectCount(0);
    setIncorrectCount(0);
  }, [cards]);

  const handleGrade = useCallback(
    (correct: boolean) => {
      if (correct) {
        setCorrectCount((c) => c + 1);
      } else {
        setIncorrectCount((c) => c + 1);
      }

      if (index >= total - 1) {
        setCompleteOpen(true);
        return;
      }
      goNext();
    },
    [goNext, index, total],
  );

  const handleStudyAgain = useCallback(() => {
    setOrderedCards([...cards]);
    setIndex(0);
    setShowBack(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setCompleteOpen(false);
  }, [cards]);

  useEffect(() => {
    function isTypingTarget(el: EventTarget | null) {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT")
        return true;
      if (el.isContentEditable) return true;
      return Boolean(el.closest('[role="textbox"]'));
    }

    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (showBack) return;
        goNext();
        return;
      }
      if (e.key === " ") {
        e.preventDefault();
        setShowBack((v) => !v);
        return;
      }
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [goPrev, goNext, showBack]);

  const progressValue = total > 0 ? ((index + 1) / total) * 100 : 0;

  return (
    <div className="flex w-full max-w-lg flex-col gap-6 mx-auto">
      <div className="flex flex-wrap items-center justify-end gap-2 text-sm text-zinc-500">
        <span>
          Card {index + 1} of {total}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <Progress value={progressValue} className="w-full" />
        <p className="text-xs text-zinc-500">
          Space flips the card · ← previous · next → · With the answer showing,
          choose Correct or Incorrect
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={handleShuffle}
      >
        <Shuffle className="size-4" />
        Shuffle deck
      </Button>

      <div className="flex w-full items-stretch gap-2">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous card"
          className={cn(
            "flex w-14 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border border-zinc-700/80 bg-zinc-900/40 px-1 transition-colors",
            "hover:border-zinc-600 hover:bg-zinc-800/60",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <ChevronLeft className="size-7 text-zinc-300" aria-hidden />
        </button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowBack((v) => !v)}
          className="h-auto min-h-0 min-w-0 flex-1 rounded-xl p-0 text-left font-normal hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="min-h-[220px] w-full transition-colors hover:border-zinc-600">
            <CardHeader className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {showBack ? "Back" : "Front"}
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-lg leading-relaxed text-zinc-100 whitespace-pre-wrap">
                {showBack ? current.back : current.front}
              </p>
            </CardContent>
            <CardFooter className="justify-end border-t-0 pt-0 text-xs text-zinc-500">
              Tap to flip
            </CardFooter>
          </Card>
        </Button>

        {!showBack ? (
          <button
            type="button"
            onClick={goNext}
            aria-label="Next card"
            className={cn(
              "flex w-14 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border border-zinc-700/80 bg-zinc-900/40 px-1 transition-colors",
              "hover:border-zinc-600 hover:bg-zinc-800/60",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <ChevronRight className="size-7 text-zinc-300" aria-hidden />
          </button>
        ) : (
          <div className="w-14 shrink-0" aria-hidden />
        )}
      </div>

      {showBack && (
        <div className="flex gap-3">
          <Button
            type="button"
            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500"
            onClick={() => handleGrade(true)}
          >
            Correct
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1"
            onClick={() => handleGrade(false)}
          >
            Incorrect
          </Button>
        </div>
      )}

      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent
          showCloseButton={false}
          overlayClassName="fixed inset-0 isolate z-50 bg-black duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
          className={cn(
            "max-w-md gap-0 border border-zinc-700/80 bg-[#181818] p-8 text-center sm:max-w-md",
            "ring-0 ring-transparent",
          )}
        >
          <DialogHeader className="items-center gap-2 space-y-0 text-center">
            <DialogTitle className="text-xl font-bold tracking-tight text-white">
              Study Session Complete!
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400">
              Great job studying {deckTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 flex justify-around gap-4 px-2">
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold tabular-nums text-emerald-400">
                {correctCount}
              </span>
              <span className="text-sm text-zinc-400">Correct</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold tabular-nums text-red-500">
                {incorrectCount}
              </span>
              <span className="text-sm text-zinc-400">Incorrect</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold tabular-nums text-white">
                {accuracyPct}%
              </span>
              <span className="text-sm text-zinc-400">Accuracy</span>
            </div>
          </div>

          <div className="mt-10 flex gap-3">
            <Button
              type="button"
              className="h-11 flex-1 gap-2 rounded-lg border-0 bg-[#E0E0E0] font-medium text-zinc-900 hover:bg-[#d4d4d4]"
              onClick={handleStudyAgain}
            >
              <RefreshCw className="size-4" />
              Study Again
            </Button>
            <Link
              href={`/decks/${deckId}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 flex-1 gap-2 rounded-lg border-zinc-600 bg-transparent font-medium text-white hover:bg-zinc-800 hover:text-white",
              )}
            >
              <ArrowLeft className="size-4" />
              Back to Deck
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
