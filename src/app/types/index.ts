import { Types } from 'mongoose';

export type TDeposit = {
  type: 'deposit';
  amount: number;
  recipientNumber: number;
  user: Types.ObjectId;
  password: string;
};

export type TTransfer = {
  type: 'transfer';
  amount: number;
  recipientNumber: number;
  user: Types.ObjectId;
  password: string;
};

export type TWithdraw = {
  type: 'withdraw';
  amount: number;
  agentNumber: string;
  user: Types.ObjectId;
  password: string;
};
