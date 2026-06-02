"use server";

import db from "@/lib/db";
import crypto from "crypto";
import { RegisterSchema, LoginSchema } from "@/lib/validations/auth";

/**
 * Hashes passwords securely using SHA-256 via Node's native crypto module
 */
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Registers a new User inside the PostgreSQL database
 */
export async function registerUser(data: any) {
  try {
    // Validate input schema
    const parsed = RegisterSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const { legalName, email, password, role } = parsed.data;

    // Check unique constraints
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists." };
    }

    const passwordHash = hashPassword(password);

    const user = await db.user.create({
      data: {
        legalName,
        email,
        passwordHash,
        role,
        createdAt: new Date(),
      },
    });

    return {
      success: true,
      user: {
        id: user.id,
        legalName: user.legalName,
        email: user.email,
        role: user.role,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected registration error occurred." };
  }
}

/**
 * Validates user credentials and initiates login
 */
export async function loginUser(data: any) {
  try {
    // Validate input schema
    const parsed = LoginSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    const { email, password } = parsed.data;

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: "Invalid email or password. Please try again." };
    }

    // Hash input password and match hash
    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return { success: false, error: "Invalid email or password. Please try again." };
    }

    return {
      success: true,
      user: {
        id: user.id,
        legalName: user.legalName,
        email: user.email,
        role: user.role,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected login error occurred." };
  }
}
