import express from "express";
import cors from "cors";
import authRouter from "./modules/auth/auth.routes";
import projectsRouter from "./modules/projects/projects.routes";
import cardsRouter from "./modules/cards/cards.routes";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isAllowedOrigin = allowedOrigins.includes(origin);
      const isKaziBoardVercelPreview =
        origin.endsWith(".vercel.app") && origin.includes("kaziboard");

      if (isAllowedOrigin || isKaziBoardVercelPreview) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "kaziboard-api",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/columns", cardsRouter);

export default app;