import { Schema, model } from 'mongoose';
import { TTransaction } from './transaction.interface';

const transactionSchema = new Schema<TTransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdraw', 'transfer'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than zero"],
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return this.type === 'deposit';
      },
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return this.type === 'transfer' || this.type === 'withdraw';
      },
    },
  },
  { timestamps: true }
);

export const Transaction = model<TTransaction>('Transaction', transactionSchema);
