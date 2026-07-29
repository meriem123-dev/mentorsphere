
import { useState } from "react";
import { Paperclip, Send } from "lucide-react";

type Props = {
  partnerName: string;
  onSend: (content: string) => void;
};

export function ChatInput({ partnerName, onSend }: Props) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <div className="flex items-center gap-2 border-t border-border p-3">
      <button className="text-muted-foreground hover:text-foreground">
        <Paperclip className="h-4 w-4" />
      </button>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder={`Envoyer un message à ${partnerName}...`}
        className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
      />
      <button
        onClick={handleSend}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy text-white"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}