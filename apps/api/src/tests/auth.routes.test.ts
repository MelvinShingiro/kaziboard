import request from "supertest";
import app from "../app";
import { cleanupTestData, disconnectTestDb, registerTestUser } from "./testUtils";

describe("Auth routes", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await disconnectTestDb();
  });

  it("registers a user successfully", async () => {
    const result = await registerTestUser("register");

    expect(result.response.status).toBe(201);
    expect(result.response.body.success).toBe(true);
    expect(result.response.body.user.email).toBe(result.email);
    expect(result.response.body.token).toEqual(expect.any(String));
  });

  it("logs in a user successfully", async () => {
    const result = await registerTestUser("login");

    const response = await request(app).post("/api/auth/login").send({
      email: result.email,
      password: result.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe(result.email);
    expect(response.body.token).toEqual(expect.any(String));
  });

  it("rejects an invalid login", async () => {
    const result = await registerTestUser("invalid-login");

    const response = await request(app).post("/api/auth/login").send({
      email: result.email,
      password: "WrongPassword123!",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid email or password");
  });
});
