"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

type Props = {
  mentorshipId: string;
  meetingUrl: string;
  sessionNumber: number;
  userName: string;
};

export function SessionRoom({
  mentorshipId,
  meetingUrl,
  sessionNumber,
  userName,
}: Props) {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          Session #{sessionNumber}
        </p>
        <button
          onClick={() => router.push(`/workspace/${mentorshipId}`)}
          className="flex items-center gap-1.5 rounded-3xl bg-card px-3 py-1.5 text-xs font-medium text-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Quitter
        </button>
      </div>

      <iframe
        src={`${meetingUrl}#config.prejoinPageEnabled=false&config.disableModeratorIndicator=true&config.startWithAudioMuted=false&userInfo.displayName="${encodeURIComponent(userName)}"`}
        allow="camera; microphone; fullscreen; display-capture"
        className="h-[80vh] w-full rounded-2xl border-0"
      />
    </div>
  );
}
