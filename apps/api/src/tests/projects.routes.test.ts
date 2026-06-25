import request from "supertest";
import app from "../app";
import {
  cleanupTestData,
  createProjectForToken,
  disconnectTestDb,
  registerTestUser,
} from "./testUtils";

describe("Project routes", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await disconnectTestDb();
  });

  it("creates a project with a valid token", async () => {
    const { token } = await registerTestUser("create-project");

    const response = await createProjectForToken(token, "Project One");

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.project.name).toBe("Project One");
  });

  it("rejects project creation without a token", async () => {
    const response = await request(app).post("/api/projects").send({
      name: "Unauthorized Project",
      description: "Should fail",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("gets the authenticated user's projects", async () => {
    const { token } = await registerTestUser("get-projects");

    await createProjectForToken(token, "First Project");
    await createProjectForToken(token, "Second Project");

    const response = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.projects).toHaveLength(2);
  });

  it("gets the project board for the authenticated owner", async () => {
    const { token } = await registerTestUser("project-board");

    const createResponse = await createProjectForToken(token, "Board Project");
    const projectId = createResponse.body.project.id as number;

    const response = await request(app)
      .get(`/api/projects/${projectId}/board`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.project.name).toBe("Board Project");
    expect(response.body.project.columns).toHaveLength(3);
  });

  it.todo("updates a project when a PATCH route exists");
  it.todo("deletes a project when a DELETE route exists");
});
