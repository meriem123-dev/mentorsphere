import express from "express";
import cors from "cors";

// app
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

export default app;