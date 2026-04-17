"use client";

import { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SignInDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" />}>Sign in</DialogTrigger>
      <DialogContent className="p-0 max-w-fit overflow-hidden">
        <SignIn routing="hash" forceRedirectUrl="/dashboard" />
      </DialogContent>
    </Dialog>
  );
}
