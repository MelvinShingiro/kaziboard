import request from "supertest";
import app from "../app";
import { prisma } from "../config/db";
import {
  cleanupTestData,
  disconnectTestDb,
  registerTestUser,
  buildTestEmail,
} from "./testUtils";

describe("Auth routes", () => {
  afterEach(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await disconnectTestDb();
  });

  it("registers a user successfully without logging them in", async () => {
    const email = buildTestEmail("register");
    const password = "Password123!";

    const response = await request(app).post("/api/auth/register").send({
      name: "Jest User",
      email,
      password,
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe(email);
    expect(response.body.user.emailVerified).toBe(false);
    expect(response.body.token).toBeUndefined();
    expect(response.body.message).toMatch(/check your email/i);
  });

  it("rejects login before email verification", async () => {
    const email = buildTestEmail("unverified-login");
    const password = "Password123!";

    await request(app).post("/api/auth/register").send({
      name: "Jest User",
      email,
      password,
    });

    const response = await request(app).post("/api/auth/login").send({
      email,
      password,
    });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Please verify your email before logging in."
    );
  });

  it("logs in a user successfully after verification", async () => {
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

  it("verifies email with a valid token", async () => {
    const email = buildTestEmail("verify");
    const password = "Password123!";

    const registerResponse = await request(app).post("/api/auth/register").send({
      name: "Jest User",
      email,
      password,
    });

    const userId = registerResponse.body.user.id as number;
    const tokenRecord = await prisma.emailVerificationToken.findFirst({
      where: { userId },
    });

    expect(tokenRecord).not.toBeNull();

    const response = await request(app)
      .get("/api/auth/verify-email")
      .query({ token: tokenRecord!.token });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user?.emailVerified).toBe(true);

    const remainingToken = await prisma.emailVerificationToken.findUnique({
      where: { token: tokenRecord!.token },
    });
    expect(remainingToken).toBeNull();
  });

  it("rejects an invalid verification token", async () => {
    const response = await request(app)
      .get("/api/auth/verify-email")
      .query({ token: "not-a-real-token" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid or expired verification token");
  });

  it("rejects an expired verification token", async () => {
    const email = buildTestEmail("expired-token");
    const password = "Password123!";

    const registerResponse = await request(app).post("/api/auth/register").send({
      name: "Jest User",
      email,
      password,
    });

    const userId = registerResponse.body.user.id as number;
    const tokenRecord = await prisma.emailVerificationToken.findFirst({
      where: { userId },
    });

    await prisma.emailVerificationToken.update({
      where: { id: tokenRecord!.id },
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });

    const response = await request(app)
      .get("/api/auth/verify-email")
      .query({ token: tokenRecord!.token });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid or expired verification token");
  });

  it("resends verification email", async () => {
    const email = buildTestEmail("resend");
    const password = "Password123!";

    const registerResponse = await request(app).post("/api/auth/register").send({
      name: "Jest User",
      email,
      password,
    });

    const userId = registerResponse.body.user.id as number;
    const oldToken = await prisma.emailVerificationToken.findFirst({
      where: { userId },
    });

    const response = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "If an account exists, a verification email has been sent."
    );

    const tokens = await prisma.emailVerificationToken.findMany({
      where: { userId },
    });
    expect(tokens).toHaveLength(1);
    expect(tokens[0].token).not.toBe(oldToken!.token);
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
