export type Card = {
  id: number;
  title: string;
  description: string | null;
  position: number;
  columnId: number;
  createdAt: string;
};

export type Column = {
  id: number;
  name: string;
  position: number;
  projectId: number;
  createdAt: string;
  cards: Card[];
};

export type Project = {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: string;
  columns: Column[];
};
