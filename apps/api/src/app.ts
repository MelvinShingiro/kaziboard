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
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health",(req,res)=>{
        res.json({
                status:"ok",
                service: "kaziboard-api",
        });
});

app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/columns", cardsRouter);
app.use("api/columns",cardsRouter);



export default app;