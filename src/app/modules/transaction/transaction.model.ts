import { Schema, model } from 'mongoose';
import { TTransaction } from './transaction.interface';

const transactionSchema = new Schema<TTransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transactionId: {
      type: String,
    },

    type: {
      type: String,
      enum: ['deposit', 'withdraw', 'transfer'],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be greater than zero'],
    },

    recipientNumber: {
      type: String, // Changed to String to handle leading zeros
      required: function () {
        return this.type === 'transfer'; // Only required for transfers
      },
      minlength: 10,
      maxlength: 10,
      match: [/^\d{10}$/, 'Phone number must be exactly 10 digits'],
    },
    agentNumber: {
      type: String, // Changed to String to handle leading zeros
      required: function () {
        return this.type === 'withdraw'; // Only required for withdraw
      },
      minlength: 10,
      maxlength: 10,
      match: [/^\d{10}$/, 'Phone number must be exactly 10 digits'],
    },

    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return this.type === 'transfer'; // Required for transfers
      },
    },

    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return this.type === 'withdraw'; // Required for deposit & withdraw
      },
    },
  },
  { timestamps: true },
);

export const Transaction = model<TTransaction>(
  'Transaction',
  transactionSchema,
);
