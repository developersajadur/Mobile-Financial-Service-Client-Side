import { Types } from 'mongoose';
import { USER_ROLE } from './user.constant';

export type TUser = {
  _id?: Types.ObjectId;
  fullName: string;
  email: string;
  phoneNumber: number; // Store as number
  nidNumber: number;   // Store as number
  password: string;    // Store as string for secure hashing
  balance: number;
  isVerified: boolean;
  role: 'user' | 'agent' | 'admin';
  totalMoney?: number;
  income?: number;
  isBlocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};


export type TUserRole = keyof typeof USER_ROLE;
