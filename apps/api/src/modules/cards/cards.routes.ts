import { Router, Request, Response } from "express";
import { authenticate } from "../../middleware/authenticate";
import { validateBody } from "../auth/auth.routes";
import {
  createCardSchema,
  updateCardSchema,
  type CreateCardInput,
  type UpdateCardInput,
} from "./cards.schema";
import { createCard, deleteCard, moveCard, updateCard } from "./cards.service";

const cardsRouter = Router();

function handleCardErrors(error: unknown, res: Response, label: string) {
  if (
    error instanceof Error &&
    (error.message === "Card not found" || error.message === "Column not found")
  ) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }

  console.log(`${label}:`, error);

  return res.status(500).json({
    success: false,
    message: "Server error",
  });
}

cardsRouter.post(
  "/:columnId/cards",
  authenticate,
  validateBody(createCardSchema),
  async (req: Request<{ columnId: string }, {}, CreateCardInput>, res: Response) => {
    try {
      const columnId = Number(req.params.columnId);
      const ownerId = (req as any).userId;

      if (Number.isNaN(columnId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid column id",
        });
      }

      const card = await createCard(req.body, columnId, ownerId);

      return res.status(201).json({
        success: true,
        message: "Card created successfully",
        card,
      });
    } catch (error) {
      return handleCardErrors(error, res, "CREATE CARD ERROR");
    }
  }
);

cardsRouter.patch(
  "/cards/:cardId",
  authenticate,
  validateBody(updateCardSchema),
  async (req: Request<{ cardId: string }, {}, UpdateCardInput>, res: Response) => {
    try {
      const cardId = Number(req.params.cardId);
      const ownerId = (req as any).userId;

      if (Number.isNaN(cardId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid card id",
        });
      }

      const card = await updateCard(cardId, req.body, ownerId);

      return res.status(200).json({
        success: true,
        message: "Card updated successfully",
        card,
      });
    } catch (error) {
      return handleCardErrors(error, res, "UPDATE CARD ERROR");
    }
  }
);

cardsRouter.delete(
  "/cards/:cardId",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const cardId = Number(req.params.cardId);
      const ownerId = (req as any).userId;

      if (Number.isNaN(cardId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid card id",
        });
      }

      const card = await deleteCard(cardId, ownerId);

      return res.status(200).json({
        success: true,
        message: "Card deleted successfully",
        card,
      });
    } catch (error) {
      return handleCardErrors(error, res, "DELETE CARD ERROR");
    }
  }
);

cardsRouter.patch(
  "/cards/:cardId/move",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const cardId = Number(req.params.cardId);
      const targetColumnId = Number(req.body.targetColumnId);
      const ownerId = (req as any).userId;

      if (Number.isNaN(cardId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid card id",
        });
      }

      if (Number.isNaN(targetColumnId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid target column id",
        });
      }

      const card = await moveCard(cardId, targetColumnId, ownerId);

      return res.status(200).json({
        success: true,
        message: "Card moved successfully",
        card,
      });
    } catch (error) {
      return handleCardErrors(error, res, "MOVE CARD ERROR");
    }
  }
);

export default cardsRouter;