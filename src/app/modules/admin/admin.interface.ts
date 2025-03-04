import { Types } from 'mongoose';

export type TAdmin = {
  _id?: Types.ObjectId;
  fullName: string;
  email: string;
  phoneNumber: number;
  password: string;
  balance: number;
  role: 'admin';
  totalMoney: number;
  createdAt?: Date;
  updatedAt?: Date;
};
