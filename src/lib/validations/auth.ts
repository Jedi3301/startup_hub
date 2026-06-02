import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  legalName: z.string().min(2, "Legal name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["Founder", "Contributor"], {
    required_error: "Please select a role",
  }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
