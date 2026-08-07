
import { MessageSquare, Calendar, Target, FileText, Users } from "lucide-react";
import type { WorkspaceTab } from "../../../types/workspaceTypes";

const TABS: { key: WorkspaceTab; label: string; icon: typeof MessageSquare }[] = [
  { key: "chat", label: "Chat", icon: MessageSquare },
  { key: "sessions", label: "Sessions", icon: Calendar },
  { key: "objectifs", label: "Objectifs", icon: Target },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "members", label: "Membres", icon: Users },
];

type Props = {
  active: WorkspaceTab;
  onChange: (tab: WorkspaceTab) => void;
};

export function WorkspaceTabNav({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap sm:w-fit gap-1 rounded-xl bg-muted p-1">
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-gradient-brand text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}