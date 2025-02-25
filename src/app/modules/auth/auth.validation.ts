import { z } from 'zod';

// Define the login validation schema
const loginUserValidation = z.object({
  body: z.object({
    phoneNumber: z
      .string()
      .length(10, { message: 'Phone number must be exactly 10 digits' })
      .regex(/^\d{10}$/, { message: 'Phone number must contain only numbers' }),
    password: z
      .string()
      .length(5, { message: 'Password must be exactly 5 characters long' }),
  }),
});

export const AuthValidationSchema = {
  loginUserValidation,
};
