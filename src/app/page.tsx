import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Show } from "@clerk/nextjs";
import { SignInDialog, SignUpDialog } from "@/components/auth-dialogs";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-white">
        FlashyCardy
      </h1>
      <p className="text-lg text-zinc-400">
        Your personal flashcard platform
      </p>
      <Show when="signed-out">
        <div className="flex items-center gap-3 mt-2">
          <SignInDialog />
          <SignUpDialog />
        </div>
      </Show>
    </main>
  );
}
