import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
  },
});

io.on("connection", (socket) => {
  console.log("Socket connecté:", socket.id);
});

server.listen(PORT, () => {
  console.log(`Backend démarré sur le port ${PORT}`);
});