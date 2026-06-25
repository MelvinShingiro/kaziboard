import { z } from "zod";

const cardPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const createCardSchema = z.object({
  title: z.string().min(1, "Card title is required"),
  description: z.string().optional(),
  priority: cardPrioritySchema.optional(),
  dueDate: z.string().nullable().optional(),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;

export const updateCardSchema = z.object({
  title: z.string().min(1, "Card title is required"),
  description: z.string().optional(),
  priority: cardPrioritySchema,
  dueDate: z.string().nullable().optional(),
});

export type UpdateCardInput = z.infer<typeof updateCardSchema>;