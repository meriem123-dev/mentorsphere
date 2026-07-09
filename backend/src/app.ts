import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
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

app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);



export default app;