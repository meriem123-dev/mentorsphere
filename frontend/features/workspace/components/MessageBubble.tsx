
type Props = {
  content: string;
  createdAt: string;
  senderInitials: string;
  isOwn: boolean;
};

export function MessageBubble({ content, createdAt, senderInitials, isOwn }: Props) {
  const time = new Date(createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${
          isOwn ? "bg-brand-blue" : "bg-brand-rose"
        }`}
      >
        {senderInitials}
      </span>
      <div className={`flex max-w-[70%] flex-col ${isOwn ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm ${
            isOwn ? "bg-brand-blue text-white" : "bg-brand-rose text-white"
          }`}
        >
          {content}
        </div>
        <span className="mt-1 text-[11px] text-muted-foreground">{time}</span>
      </div>
    </div>
  );
}