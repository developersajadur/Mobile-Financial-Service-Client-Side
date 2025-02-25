import { z } from 'zod';

const createTransactionValidation = z.object({
  body: z.object({
    user: z.string().min(1, { message: "User ID is required" }).optional(),
    type: z.enum(['deposit', 'withdraw', 'transfer'], {
      message: "Transaction type must be 'deposit', 'withdraw', or 'transfer'",
    }),
    amount: z.number().min(1, { message: "Amount must be greater than zero" }),

    recipient: z.string().optional().nullable(), // Nullable for flexibility
    agentId: z.string().optional().nullable(),   // Nullable for flexibility
  })
  .refine((data) => {
    // If transaction type is 'deposit' or 'withdraw', agentId is required
    if (data.type === 'transfer' || data.type === 'withdraw') {
      return !!data.agentId;
    }
    return true;
  }, {
    message: "Agent ID is required for deposit and withdraw transactions",
    path: ["agentId"],
  })
  .refine((data) => {
    // If transaction type is 'transfer', recipient is required
    if (data.type === 'deposit') {
      return !!data.recipient;
    }
    return true;
  }, {
    message: "Recipient ID is required for transfer transactions",
    path: ["recipient"],
  }),
});

export const transactionValidationSchema = {
  createTransactionValidation,
};
