import express from "express";
import cors from "cors";
import morgan from "morgan";
import multer from "multer";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import startupRoutes from "./routes/startupRoutes";
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
app.use("/api/startups", startupRoutes);

//404 pour les routes inconnues
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route introuvable",
  });
});

//gestion centralisée des erreurs 
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Fichier trop volumineux (max 5 Mo)",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Erreur d'upload : ${err.message}`,
    });
  }

  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Erreur interne du serveur",
  });
});

export default app;