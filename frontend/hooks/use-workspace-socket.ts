"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { WorkspaceMessage } from "@/types/workspaceTypes";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL!;

type NotesUpdatePayload = {
  sessionId: string;
  content: string;
};

export function useWorkspaceSocket(
  mentorshipId: string | undefined,
  onNewMessage: (message: WorkspaceMessage) => void,
  onNotesUpdate?: (payload: NotesUpdatePayload) => void,
) {
  const socketRef = useRef<Socket | null>(null);
  const onNotesUpdateRef = useRef(onNotesUpdate);

  useEffect(() => {
    onNotesUpdateRef.current = onNotesUpdate;
  }, [onNotesUpdate]);

  useEffect(() => {
    if (!mentorshipId) return;

    const socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_workspace", mentorshipId, (res: { error?: string }) => {
        if (res?.error) {
          console.error("Impossible de rejoindre le workspace:", res.error);
        }
      });
    });

    socket.on("new_message", (message: WorkspaceMessage) => {
      onNewMessage(message);
    });

    socket.on("notes_update", (payload: NotesUpdatePayload) => {
      onNotesUpdateRef.current?.(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [mentorshipId, onNewMessage]);

  const sendMessage = useCallback((content: string) => {
    if (!mentorshipId || !socketRef.current) return;

    socketRef.current.emit(
      "send_message",
      { mentorshipId, content },
      (res: { error?: string }) => {
        if (res?.error) console.error("Erreur envoi message:", res.error);
      },
    );
  }, [mentorshipId]);

  const sendNotesUpdate = useCallback((sessionId: string, content: string) => {
    if (!mentorshipId || !socketRef.current) return;

    socketRef.current.emit("notes_update", { mentorshipId, sessionId, content });
  }, [mentorshipId]);

  return { sendMessage, sendNotesUpdate };
}