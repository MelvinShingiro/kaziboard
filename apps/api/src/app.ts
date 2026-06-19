import express from "express";
import cors from "cors";
import authRouter from "./modules/auth/auth.routes";
import projectsRouter from "./modules/projects/projects.routes";
import cardsRouter from "./modules/cards/cards.routes";



const app = express();

app.use(cors());
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



export default app;