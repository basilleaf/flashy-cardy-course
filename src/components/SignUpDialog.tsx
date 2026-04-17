"use client";

import { useState } from "react";
import { SignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SignUpDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="default" />}>Sign up</DialogTrigger>
      <DialogContent className="p-0 max-w-fit overflow-hidden">
        <SignUp routing="hash" forceRedirectUrl="/dashboard" />
      </DialogContent>
    </Dialog>
  );
}
