import { z } from 'zod';

const createTransactionValidation = z.object({
  body: z.object({
    user: z.string().min(1, { message: "User ID is required" }).optional(),
    
    type: z.enum(['deposit', 'withdraw', 'transfer'], {
      message: "Transaction type must be 'deposit', 'withdraw', or 'transfer'",
    }),

    amount: z.number().min(1, { message: "Amount must be greater than zero" }),

    recipientNumber: z
      .string()
      .length(10, { message: "Phone number must be exactly 10 digits" })
      .regex(/^\d{10}$/, { message: "Phone number must contain only numbers" })
      .optional(), // Will make this required based on the type

    recipient: z.string().optional().nullable(), // Nullable for flexibility
    agentId: z.string().optional().nullable(),   // Nullable for flexibility
  })
  .refine((data) => {
    // If transaction type is 'deposit' or 'withdraw', agentId is required
    if ( data.type === 'withdraw') {
      return !!data.agentId;
    }
    return true;
  }, {
    message: "Agent ID is required for withdraw transactions",
    path: ["agentId"],
  })
  .refine((data) => {
    // If transaction type is 'transfer', recipientNumber is required
    if (data.type === 'transfer') {
      return !!data.recipientNumber;
    }
    // If transaction type is 'deposit', recipientNumber is also required
    if (data.type === 'deposit') {
      return !!data.recipientNumber;
    }
    return true;
  }, {
    message: "Recipient phone number is required for deposit and transfer transactions",
    path: ["recipientNumber"],
  }),
});

export const transactionValidationSchema = {
  createTransactionValidation,
};
