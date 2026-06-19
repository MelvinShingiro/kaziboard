import { Router, Request, Response } from "express";
import { authenticate } from "../../middleware/authenticate";
import { validateBody } from "../auth/auth.routes";
import { createCardSchema, type CreateCardInput } from "./cards.schema";
import { createCard } from "./cards.service";


const cardsRouter = Router();

cardsRouter.post(
  "/:columnId/cards",
  authenticate,
  validateBody(createCardSchema),
  async (req: Request<{ columnId: string }, {}, CreateCardInput>, res: Response) => {
    try {
      const columnId = Number(req.params.columnId);

      if (Number.isNaN(columnId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid column id",
        });
      }

      const card = await createCard(req.body, columnId);

      return res.status(201).json({
        success: true,
        message: "Card created successfully",
        card,
      });
    } catch (error) {
  console.log("CREATE CARD ERROR:", error);

  return res.status(500).json({
    success: false,
    message: error instanceof Error ? error.message : "Server error",
  });
}
  }
);


export default cardsRouter;