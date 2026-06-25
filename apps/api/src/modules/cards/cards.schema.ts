import { z } from "zod";

export const createCardSchema = z.object({
  title: z.string().min(1, "Card title is required"),
  description: z.string().optional(),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;

export const updateCardSchema = z.object({
  title: z.string().min(1, "Card title is required"),
  description: z.string().optional(),
});

export type UpdateCardInput = z.infer<typeof updateCardSchema>;