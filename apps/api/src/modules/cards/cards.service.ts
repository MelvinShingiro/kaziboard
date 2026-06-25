import { prisma } from "../../config/db";
import type { CreateCardInput, UpdateCardInput } from "./cards.schema";

function parseDueDate(dueDate?: string | null) {
  if (!dueDate) {
    return null;
  }

  return new Date(dueDate);
}

export async function createCard(
  input: CreateCardInput,
  columnId: number,
  ownerId: number
) {
  const { title, description, priority, dueDate } = input;

  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      project: {
        ownerId,
      },
    },
  });

  if (!column) {
    throw new Error("Column not found");
  }

  const cardsCount = await prisma.card.count({
    where: {
      columnId,
    },
  });

  const position = cardsCount + 1;

  const card = await prisma.card.create({
    data: {
      title,
      description,
      priority: priority ?? "MEDIUM",
      dueDate: parseDueDate(dueDate),
      columnId,
      position,
    },
  });

  return card;
}

export async function updateCard(
  cardId: number,
  input: UpdateCardInput,
  ownerId: number
) {
  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      column: {
        project: {
          ownerId,
        },
      },
    },
  });

  if (!card) {
    throw new Error("Card not found");
  }

  const updatedCard = await prisma.card.update({
    where: {
      id: cardId,
    },
    data: {
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate: parseDueDate(input.dueDate),
    },
  });

  return updatedCard;
}

export async function deleteCard(cardId: number, ownerId: number) {
  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      column: {
        project: {
          ownerId,
        },
      },
    },
  });

  if (!card) {
    throw new Error("Card not found");
  }

  await prisma.card.delete({
    where: {
      id: cardId,
    },
  });

  return card;
}

export async function moveCard(
  cardId: number,
  targetColumnId: number,
  ownerId: number
) {
  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      column: {
        project: {
          ownerId,
        },
      },
    },
  });

  if (!card) {
    throw new Error("Card not found");
  }

  const targetColumn = await prisma.column.findFirst({
    where: {
      id: targetColumnId,
      project: {
        ownerId,
      },
    },
  });

  if (!targetColumn) {
    throw new Error("Column not found");
  }

  const cardsCount = await prisma.card.count({
    where: {
      columnId: targetColumnId,
    },
  });

  const newPosition = cardsCount + 1;

  const updatedCard = await prisma.card.update({
    where: {
      id: cardId,
    },
    data: {
      columnId: targetColumnId,
      position: newPosition,
    },
  });

  return updatedCard;
}