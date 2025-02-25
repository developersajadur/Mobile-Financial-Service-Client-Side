import { Types } from 'mongoose';

export type TTransaction = {
  _id?: Types.ObjectId;
  user: Types.ObjectId; // User performing the transaction
  type: 'deposit' | 'withdraw' | 'transfer'; // Transaction type
  amount: number; // Transaction amount
  recipientNumber?: number;
  agentNumber?: number;
  totalMoney?: number
  recipient?: Types.ObjectId; // Required for transfers
  agentId?: Types.ObjectId; // Required for deposit and withdraw
  createdAt?: Date;
  updatedAt?: Date;
};
