import "dotenv/config";
import http from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import app from "./app.js";
import prisma from "./lib/prisma.js";
import { getWorkspaceAccess } from "./services/workspaceService.js";

//utile pour extraire le token JWT du cookie httpOnly
function extractTokenFromCookie(
  rawCookie: string | string[] | undefined,
): string | null {
  if (!rawCookie) return null;

  const cookie = Array.isArray(rawCookie) ? rawCookie[0] : rawCookie;
  if (!cookie) return null;

  const match = cookie.match(/(?:^|;\s*)token=([^;]+)/);
  const token = match?.[1];

  if (!token) return null;
  return decodeURIComponent(token);
}

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  },
});

// Auth middleware : lit le JWT depuis le cookie httpOnly
interface AuthedSocket extends Socket {
  userId?: string;
}

io.use((socket: AuthedSocket, next) => {
  try {
    const token = extractTokenFromCookie(socket.handshake.headers.cookie);
    if (!token) return next(new Error("UNAUTHORIZED"));

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    socket.userId = payload.userId;
    next();
  } catch {
    next(new Error("UNAUTHORIZED"));
  }
});

// ------- Events -------
io.on("connection", (socket: AuthedSocket) => {
  console.log("Socket connecté:", socket.id, "user:", socket.userId);

  socket.on("join_workspace", async (mentorshipId: string, callback) => {
    if (!socket.userId) return;

    const access = await getWorkspaceAccess(mentorshipId, socket.userId);
    if (!access || access === "FORBIDDEN") {
      return callback?.({ error: "FORBIDDEN" });
    }

    socket.join(`workspace:${mentorshipId}`);
    callback?.({ success: true });
  });

  socket.on(
    "send_message",
    async (data: { mentorshipId: string; content: string }, callback) => {
      if (!socket.userId) return;

      const { mentorshipId, content } = data;
      if (!content?.trim()) return;

      const access = await getWorkspaceAccess(mentorshipId, socket.userId);
      if (!access || access === "FORBIDDEN") {
        return callback?.({ error: "FORBIDDEN" });
      }

      const message = await prisma.message.create({
        data: {
          mentorshipId,
          senderId: socket.userId,
          content: content.trim(),
        },
        include: {
          sender: { select: { firstName: true, lastName: true } },
        },
      });

      io.to(`workspace:${mentorshipId}`).emit("new_message", {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderInitials: `${message.sender.firstName[0]}${message.sender.lastName[0]}`,
        createdAt: message.createdAt,
      });

      callback?.({ success: true });
    },
  );

  socket.on("disconnect", () => {
    console.log("Socket déconnecté:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Backend démarré sur le port ${PORT}`);
});
