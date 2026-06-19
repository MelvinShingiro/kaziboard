import { prisma } from "../../config/db";
import type { CreateCardInput } from "./cards.schema";

export async function createCard(input: CreateCardInput, columnId: number) {
  const { title, description } = input;

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
      columnId,
      position,
    },
  });

  return card;
}

export async function deleteCard(cardId: number) {
  const card = await prisma.card.findUnique({
    where: {
      id: cardId,
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