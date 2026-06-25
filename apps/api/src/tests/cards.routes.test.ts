import request from "supertest";
import app from "../app";
import {
  cleanupTestData,
  createProjectForToken,
  disconnectTestDb,
  getBoardForProject,
  registerTestUser,
} from "./testUtils";

describe("Card routes", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await disconnectTestDb();
  });

  it("creates a card inside an owned project column", async () => {
    const { token } = await registerTestUser("create-card");
    const projectResponse = await createProjectForToken(token, "Card Project");
    const boardResponse = await getBoardForProject(token, projectResponse.body.project.id);
    const columnId = boardResponse.body.project.columns[0].id as number;

    const response = await request(app)
      .post(`/api/columns/${columnId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "First Card",
        description: "Card description",
        priority: "HIGH",
        dueDate: null,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.card.title).toBe("First Card");
    expect(response.body.card.priority).toBe("HIGH");
  });

  it("edits a card", async () => {
    const { token } = await registerTestUser("edit-card");
    const projectResponse = await createProjectForToken(token, "Edit Card Project");
    const boardResponse = await getBoardForProject(token, projectResponse.body.project.id);
    const columnId = boardResponse.body.project.columns[0].id as number;

    const createResponse = await request(app)
      .post(`/api/columns/${columnId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Old Title",
        description: "Old description",
        priority: "MEDIUM",
        dueDate: null,
      });

    const cardId = createResponse.body.card.id as number;

    const response = await request(app)
      .patch(`/api/columns/cards/${cardId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Title",
        description: "Updated description",
        priority: "LOW",
        dueDate: "2026-12-31",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.card.title).toBe("Updated Title");
    expect(response.body.card.priority).toBe("LOW");
    expect(response.body.card.dueDate).toContain("2026-12-31");
  });

  it("moves a card to another column", async () => {
    const { token } = await registerTestUser("move-card");
    const projectResponse = await createProjectForToken(token, "Move Card Project");
    const boardResponse = await getBoardForProject(token, projectResponse.body.project.id);
    const sourceColumnId = boardResponse.body.project.columns[0].id as number;
    const targetColumnId = boardResponse.body.project.columns[1].id as number;

    const createResponse = await request(app)
      .post(`/api/columns/${sourceColumnId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Movable Card",
        description: "Move me",
        priority: "MEDIUM",
        dueDate: null,
      });

    const cardId = createResponse.body.card.id as number;

    const response = await request(app)
      .patch(`/api/columns/cards/${cardId}/move`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        targetColumnId,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.card.columnId).toBe(targetColumnId);
  });

  it("deletes a card", async () => {
    const { token } = await registerTestUser("delete-card");
    const projectResponse = await createProjectForToken(token, "Delete Card Project");
    const boardResponse = await getBoardForProject(token, projectResponse.body.project.id);
    const columnId = boardResponse.body.project.columns[0].id as number;

    const createResponse = await request(app)
      .post(`/api/columns/${columnId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Delete Me",
        description: "Temporary card",
        priority: "MEDIUM",
        dueDate: null,
      });

    const cardId = createResponse.body.card.id as number;

    const response = await request(app)
      .delete(`/api/columns/cards/${cardId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.card.id).toBe(cardId);
  });

  it("rejects card creation without a token", async () => {
    const { token } = await registerTestUser("create-card-no-token");
    const projectResponse = await createProjectForToken(token, "Unauthorized Card Project");
    const boardResponse = await getBoardForProject(token, projectResponse.body.project.id);
    const columnId = boardResponse.body.project.columns[0].id as number;

    const response = await request(app).post(`/api/columns/${columnId}/cards`).send({
      title: "Should Fail",
      description: "No token",
      priority: "MEDIUM",
      dueDate: null,
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
