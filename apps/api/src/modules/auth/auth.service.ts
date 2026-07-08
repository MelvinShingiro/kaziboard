//business logic/ database logic

import bcrypt from "bcrypt";
import crypto from "crypto";
import type { RegisterInput } from "./auth.schema";
import { prisma } from "../../config/db";
import type { LoginInput } from "./auth.schema";
import { sendVerificationEmail } from "../../utils/email";

const SALT_ROUNDS = 10;
const VERIFICATION_TOKEN_HOURS = 24;

async function createAndSendVerificationToken(userId: number, email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_HOURS * 60 * 60 * 1000
  );

  await prisma.emailVerificationToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  await sendVerificationEmail(email, token);
}

export async function registerUser(input: RegisterInput) {
  const { name, email, password } = input;

  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: hashPassword,
      emailVerified: false,
    },
  });

  await createAndSendVerificationToken(user.id, user.email);

  const { password: _, ...safeUser } = user;

  return safeUser;
}

export async function loginUser(input: LoginInput) {
  const { email, password } = input;

  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!existingUser) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    existingUser.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  if (!existingUser.emailVerified) {
    throw new Error("Please verify your email before logging in.");
  }

  const { password: _, ...safeUser } = existingUser;

  return safeUser;
}

export async function verifyEmailToken(token: string) {
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: {
      token,
    },
  });

  if (!verificationToken) {
    throw new Error("Invalid or expired verification token");
  }

  if (verificationToken.expiresAt.getTime() < Date.now()) {
    await prisma.emailVerificationToken.delete({
      where: {
        id: verificationToken.id,
      },
    });
    throw new Error("Invalid or expired verification token");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: verificationToken.userId,
      },
      data: {
        emailVerified: true,
      },
    }),
    prisma.emailVerificationToken.delete({
      where: {
        id: verificationToken.id,
      },
    }),
  ]);

  return { message: "Email verified successfully. You can now log in." };
}

export async function resendVerificationEmail(email: string) {
  const genericMessage =
    "If an account exists, a verification email has been sent.";

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return { message: genericMessage };
  }

  if (user.emailVerified) {
    return { message: "Email is already verified." };
  }

  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await createAndSendVerificationToken(user.id, user.email);

  return { message: genericMessage };
}

export async function getUserById(userId: number) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const { password: _, ...safeUser } = user;

  return safeUser;
}
