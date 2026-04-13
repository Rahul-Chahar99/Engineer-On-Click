import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().trim().min(3, "Full name must be at least 3 characters long"),
  email: z.string().trim().lowercase().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
  username: z.string().trim().min(3, "Username must be at least 3 characters long"),
});

const loginSchema = z.object({
  email: z.string().trim().lowercase().email("Invalid email address").optional(),
  username: z.string().trim().min(3, "Username must be at least 3 characters long").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
});

export { registerSchema, loginSchema };
