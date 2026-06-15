import {Router, Request, Response, NextFunction} from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validateBody } from '../auth/auth.routes';
import { createProjectSchema } from './projects.schema';
import { CreateProjectInput } from './projects.schema';
import { createProject } from './projects.services';
import { getUserProjects } from "./projects.services";

const projectsRouter: Router = Router();

projectsRouter.post( "/", authenticate, validateBody(createProjectSchema),
  async (req: Request<{}, {}, CreateProjectInput>, res: Response) => {
    try {
      const ownerId = (req as any).userId;

      const project = await createProject(req.body, ownerId);

      return res.status(201).json({
        success: true,
        message: "Project created successfully",
        project,
      });
    } catch (error) {
//       console.log("CREATE PROJECT ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

projectsRouter.get(
  "/",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const ownerId = (req as any).userId;

      const projects = await getUserProjects(ownerId);

      return res.status(200).json({
        success: true,
        projects,
      });
    } catch (error) {
//       console.log("GET PROJECTS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);





export default projectsRouter;