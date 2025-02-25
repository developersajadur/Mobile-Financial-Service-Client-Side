import { z } from "zod";
import { USER_ROLE } from "./user.constant";

// Define the Zod schema for user validation
const createUserValidation = z.object({
  body: z.object({
    fullName: z.string().min(1, { message: "Full name is required" }).trim(),
    email: z
      .string()
      .email({ message: "Invalid email format" })
      .min(1, { message: "Email is required" }),
    phoneNumber: z
      .string()
      .length(10, { message: "Phone number must be exactly 10 digits" })
      .regex(/^\d{10}$/, { message: "Phone number must contain only numbers" }),
    nidNumber: z
      .string()
      .regex(/^\d+$/, { message: "NID number must contain only numbers" }),
    password: z
      .string()
      .length(5, { message: "Password must be exactly 5 characters long" }),
    balance: z.number().min(0, { message: "Balance cannot be negative" }).default(0),
    isVerified: z.boolean().default(false),
    role: z.enum(Object.values(USER_ROLE) as [string, ...string[]], {
      message: "Role must be either 'user', 'agent', or 'admin'",
    }),
    isBlocked: z.boolean().default(false),
  }),
});

export const userValidationSchema = {
  createUserValidation,
};
