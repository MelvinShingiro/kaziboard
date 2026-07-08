// validates input

import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({

        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),

});

export const resendVerificationSchema = z.object({
  email: z.email("Invalid email address"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;