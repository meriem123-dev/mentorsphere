"use client";

import { useState } from "react";
import { MessageSquareHeart } from "lucide-react";
import { FeedbackModal } from "./feedback-modal";

export function FeedbackFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Donner votre avis"
        className="fixed cursor-pointer bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brand text-white shadow-lg shadow-brand-navy/20 transition-transform hover:scale-105 active:scale-95"
      >
        <MessageSquareHeart className="h-6 w-6" />
      </button>
      <FeedbackModal open={open} onOpenChange={setOpen} />
    </>
  );
}