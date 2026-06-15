import express from "express";
import cors from "cors";
import authRouter from "./modules/auth/auth.routes";
import projectsRouter from "./modules/projects/projects.routes";



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



export default app;