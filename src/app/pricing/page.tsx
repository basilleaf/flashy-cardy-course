import type { Metadata } from "next";
import { PricingTable } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose a plan for FlashyCardy",
};

export default function PricingPage() {
  return (
    <main className="flex flex-1 flex-col gap-8 px-6 py-10 max-w-5xl mx-auto w-full">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
        <p className="text-zinc-400 mt-2">
          Pick the plan that fits how you study. Upgrade or change anytime.
        </p>
      </div>
      <PricingTable
        for="user"
        newSubscriptionRedirectUrl="/dashboard"
        fallback={
          <p className="text-center text-zinc-500 text-sm">Loading plans…</p>
        }
      />
    </main>
  );
}
