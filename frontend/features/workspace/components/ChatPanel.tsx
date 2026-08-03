import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import type { WorkspaceMessage } from "../../../types/workspaceTypes";

type Props = {
  messages: WorkspaceMessage[];
  partnerName: string;
  selfId: string; 
  onSend: (content: string) => void;
};

export function ChatPanel({ messages, partnerName, selfId, onSend }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex h-[520px] flex-col rounded-2xl bg-card">
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            content={m.content}
            createdAt={m.createdAt}
            senderInitials={m.senderInitials}
            isOwn={m.senderId === selfId}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <ChatInput partnerName={partnerName} onSend={onSend} />
    </div>
  );
}