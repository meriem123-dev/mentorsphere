"use client";

import { useState } from "react";
import { Send } from "lucide-react";

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };


const MOCK_REPLY = "Cette fonctionnalité n'est pas encore branchée sur Groq — réponse simulée pour tester l'interface.";

export function DiscussionIATab() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: trimmed }]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: MOCK_REPLY }]);
      setIsLoading(false);
    }, 900);
  };

  return (
    <div className="flex h-[520px] flex-col rounded-2xl border border-border">
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.length === 0 && (
          <p className="pt-16 text-center text-sm text-muted-foreground">
            Posez une question à l&apos;assistant sur votre projet ou votre mentorat.
          </p>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
              message.role === "user" ? "bg-gradient-brand text-white" : "bg-muted text-foreground"
            }`}>
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && <p className="text-xs text-muted-foreground">L&apos;assistant réfléchit...</p>}
      </div>
      <div className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Écrire un message..."
          className="flex-1 rounded-xl bg-muted px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white disabled:opacity-60"
        >
          <Send className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}