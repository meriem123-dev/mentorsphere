import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import cookieParser from "cookie-parser";

// app conf
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,                 // autorise l'envoi/réception des cookies httpOnly
  })
);
app.use(cookieParser());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);



export default app;