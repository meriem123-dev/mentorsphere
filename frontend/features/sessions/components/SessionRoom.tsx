"use client";

import { JitsiMeeting } from "@jitsi/react-sdk";

type SessionRoomProps = {
  appId: string;
  room: string;
  jwt: string;
  userName: string;
  userEmail: string;
};

export function SessionRoom({ appId, room, jwt, userName,userEmail }: SessionRoomProps) {
  return (
    <div className="h-[80vh] w-full overflow-hidden rounded-xl border border-border">
      <JitsiMeeting
        domain="8x8.vc"
        roomName={`${appId}/${room}`}
        jwt={jwt}
        userInfo={{ displayName: userName,email:userEmail }}
        configOverwrite={{
          prejoinPageEnabled: true,
          disableThirdPartyRequests: true,
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = "100%";
          iframeRef.style.width = "100%";
        }}
      />
    </div>
  );
}