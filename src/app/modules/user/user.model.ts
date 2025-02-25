import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../config';
import { TUser } from './user.interface';
import { USER_ROLE } from './user.constant';

// User schema definition
const userSchema = new Schema<TUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"],
    },
    phoneNumber: {
      type: Number, // Store as number
      required: [true, "Phone number is required"],
      unique: true,
      min: 1000000000, // Ensure it is a 10-digit number
      max: 9999999999,
    },
    nidNumber: {
      type: Number, // Store as number
      required: [true, "NID number is required"],
    },
    password: {
      type: String, // Store as string for hashing
      required: [true, "Password is required"],
      select: false,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    totalMoney: {
      type: Number,
      
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(USER_ROLE),
        message: "Role must be either 'user', 'agent', or 'admin'",
      },
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

import { Document } from "mongoose";

userSchema.pre("save", async function (next) {
  const user = this as Document & TUser; // Mongoose document with TUser properties

  if (typeof user.phoneNumber === "string") {
    user.phoneNumber = parseInt(user.phoneNumber, 10);
  }
  if (typeof user.nidNumber === "string") {
    user.nidNumber = parseInt(user.nidNumber, 10);
  }

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, Number(config.salt_rounds));
  }

  next();
});


// Create the Mongoose model
export const User = model<TUser>('User', userSchema);
