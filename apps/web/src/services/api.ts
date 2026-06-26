import type { Card, Project } from "../types/board";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type CardInput = {
  title: string;
  description: string;
  priority: Card["priority"];
  dueDate: string | null;
};

function getAuthHeaders(includeJson = false): HeadersInit {
  const token = localStorage.getItem("token");

  return {
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJsonResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export async function getProjectBoard(projectId: string): Promise<Project> {
  const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/board`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await parseJsonResponse(response);
  return data.project as Project;
}

export async function createCard(columnId: number, input: CardInput): Promise<Card> {
  const response = await fetch(`${API_BASE_URL}/api/columns/${columnId}/cards`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(input),
  });

  const data = await parseJsonResponse(response);
  return data.card as Card;
}

export async function updateCard(cardId: number, input: CardInput): Promise<Card> {
  const response = await fetch(`${API_BASE_URL}/api/columns/cards/${cardId}`, {
    method: "PATCH",
    headers: getAuthHeaders(true),
    body: JSON.stringify(input),
  });

  const data = await parseJsonResponse(response);
  return data.card as Card;
}

export async function deleteCard(cardId: number): Promise<Card> {
  const response = await fetch(`${API_BASE_URL}/api/columns/cards/${cardId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const data = await parseJsonResponse(response);
  return data.card as Card;
}

export async function moveCard(cardId: number, targetColumnId: number): Promise<Card> {
  const response = await fetch(`${API_BASE_URL}/api/columns/cards/${cardId}/move`, {
    method: "PATCH",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ targetColumnId }),
  });

  const data = await parseJsonResponse(response);
  return data.card as Card;
}

export { API_BASE_URL, getAuthHeaders };
