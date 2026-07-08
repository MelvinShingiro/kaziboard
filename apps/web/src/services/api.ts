import type { Card, Project } from "../types/board";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

type CardInput = {
  title: string;
  description: string;
  priority: Card["priority"];
  dueDate: string | null;
};

type DashboardProject = {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: string;
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

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();
  return { response, data };
}

export async function register(
  name: string,
  email: string,
  password: string
) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  const data = await response.json();
  return { response, data };
}

export async function verifyEmail(token: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`,
    {
      method: "GET",
    }
  );

  const data = await response.json();
  return { response, data };
}

export async function resendVerificationEmail(email: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  return { response, data };
}

export async function getProjects(): Promise<DashboardProject[]> {
  const response = await fetch(`${API_BASE_URL}/api/projects`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await parseJsonResponse(response);
  return data.projects as DashboardProject[];
}

export async function createProject(
  name: string,
  description: string
): Promise<DashboardProject> {
  const response = await fetch(`${API_BASE_URL}/api/projects`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({
      name,
      description,
    }),
  });

  const data = await parseJsonResponse(response);
  return data.project as DashboardProject;
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
