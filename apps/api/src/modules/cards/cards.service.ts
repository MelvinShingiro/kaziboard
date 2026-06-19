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