"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { fetchAIChatState, sendAIChatMessage } from "../../api/aiAPI";
import type { AIChatMessage } from "../../../../types/aiTypes";

interface DiscussionIATabProps {
  mentorshipId: string;
}

export function DiscussionIATab({ mentorshipId }: DiscussionIATabProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedCache, setHasCheckedCache] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState(20);
  const [windowResetAt, setWindowResetAt] = useState<string | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const checkExisting = async () => {
      try {
        const state = await fetchAIChatState(mentorshipId);
        if (!cancelled) {
          setMessages(state.messages);
          setAttemptsRemaining(state.attemptsRemaining);
          setWindowResetAt(state.windowResetAt);
        }
      } catch {
        // silencieux : la conversation démarre vide
      } finally {
        if (!cancelled) setHasCheckedCache(true);
      }
    };

    checkExisting();
    return () => {
      cancelled = true;
    };
  }, [mentorshipId]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const limitReached = attemptsRemaining <= 0;
  const resetInMs = windowResetAt ? Math.max(0, new Date(windowResetAt).getTime() - now) : 0;
  const isBlocked = limitReached && resetInMs > 0;

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || isBlocked) return;

    setInput("");
    setIsLoading(true);
    try {
      const outcome = await sendAIChatMessage(mentorshipId, trimmed);
      setMessages(outcome.messages);
      setAttemptsRemaining(outcome.attemptsRemaining);
      setWindowResetAt(outcome.windowResetAt);
      if (outcome.limitReached) {
        toast.info("Limite de messages atteinte, réessayez plus tard.");
      }
    } catch (error) {
      toast.error("Impossible d'envoyer le message.");
      setInput(trimmed); // on restitue le message pour ne pas le perdre
    } finally {
      setIsLoading(false);
    }
  };

  const resetMinutes = Math.ceil(resetInMs / 60000);

  return (
    <div className="flex h-[520px] flex-col rounded-2xl border border-border">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
        {!hasCheckedCache ? (
          <p className="pt-16 text-center text-sm text-muted-foreground">Chargement...</p>
        ) : messages.length === 0 ? (
          <p className="pt-16 text-center text-sm text-muted-foreground">
            Posez une question à l&apos;assistant sur votre projet ou votre mentorat.
          </p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  message.role === "user" ? "bg-gradient-brand text-white" : "bg-muted text-foreground"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}
        {isLoading && <p className="text-xs text-muted-foreground">L&apos;assistant réfléchit...</p>}
      </div>
      <div className="border-t border-border p-3">
        {isBlocked && (
          <p className="mb-2 text-center text-xs text-muted-foreground">
            Limite de messages atteinte — réessayez dans {resetMinutes} min
          </p>
        )}
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading || isBlocked}
            placeholder="Écrire un message..."
            className="flex-1 rounded-xl bg-muted px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || isBlocked}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white disabled:opacity-60"
          >
            <Send className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}