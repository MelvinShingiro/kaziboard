//URL paths

import { Router, Request, Response, NextFunction } from "express";
import {
  registerSchema,
  loginSchema,
  resendVerificationSchema,
} from "./auth.schema";
import { ZodObject } from "zod";
import {
  loginUser,
  registerUser,
  verifyEmailToken,
  resendVerificationEmail,
  getUserById,
} from "./auth.service";
import { generateToken } from "../../utils/token";
import { authenticate } from "../../middleware/authenticate";

//initialize the router
const authRouter: Router = Router();

//build a middleware function to handle errors in the routes

export const validateBody = (schema: ZodObject) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Perform data validation
    const result = schema.safeParse(req.body);

    // If validation fails, return a 400 Bad Request error early
    if (!result.success) {
      res.status(400).json({
        status: "fail",
        message: "Validation failed",
        errors: result.error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
      return;
    }

    // Overwrite req.body with the cleaned, parsed data
    req.body = result.data;
    next();
  };
};

//GET route that fetch ALL users may be needed later on
authRouter.get("/", (req: Request, res: Response) => {
  res.json({ message: "Fetching all users" });
});

authRouter.get("/me", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const user = await getUserById(userId);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
});

authRouter.get("/verify-email", async (req: Request, res: Response) => {
  try {
    const token = req.query.token;

    if (typeof token !== "string" || token.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const result = await verifyEmailToken(token);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Invalid or expired verification token"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

authRouter.post(
  "/register",
  validateBody(registerSchema),
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    try {
      const user = await registerUser(req.body);

      res.status(201).json({
        success: true,
        message:
          "Account created. Check your email to verify your account before logging in.",
        user,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "User already exists") {
        return res.status(409).json({
          success: false,
          message: "User already exists",
        });
      }

      res.status(500).json({ success: false, message: "Server Error" });
    }
  }
);

interface LoginBody {
  email: string;
  password: string;
}

authRouter.post(
  "/login",
  validateBody(loginSchema),
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    try {
      const { email } = req.body;

      const user = await loginUser(req.body);
      const token = generateToken(user.id);

      return res.status(200).json({
        success: true,
        message: `User ${email} logged in successfully`,
        user,
        token,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Invalid email or password"
      ) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      if (
        error instanceof Error &&
        error.message === "Please verify your email before logging in."
      ) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email before logging in.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

interface ResendVerificationBody {
  email: string;
}

authRouter.post(
  "/resend-verification",
  validateBody(resendVerificationSchema),
  async (req: Request<{}, {}, ResendVerificationBody>, res: Response) => {
    try {
      const result = await resendVerificationEmail(req.body.email);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

export default authRouter;
