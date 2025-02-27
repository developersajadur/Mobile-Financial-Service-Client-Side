import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";
import config from "../../config";
import { TUser } from "./user.interface";
import { USER_ROLE } from "./user.constant";

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
      type: Number,
      required: [true, "Phone number is required"],
      unique: true,
      min: 1000000000, // Ensure it is a 10-digit number
      max: 9999999999,
    },
    nidNumber: {
      type: Number,
      required: [true, "NID number is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    balance: {
      type: Number,
      default: 40, // Default balance for users
      min: [0, "Balance cannot be negative"],
    },
    isVerified: {
      type: Boolean,
      default: true, // By default, users are verified
    },
    role: {
      type: String,
      enum: {
        values: Object.values(USER_ROLE),
        message: "Role must be either 'user', 'agent', or 'admin'",
      },
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Middleware: Modify fields before saving
userSchema.pre("save", async function (next) {
  const user = this as Document & TUser;

  // Ensure phoneNumber and nidNumber are stored as numbers
  if (typeof user.phoneNumber === "string") {
    user.phoneNumber = parseInt(user.phoneNumber, 10);
  }
  if (typeof user.nidNumber === "string") {
    user.nidNumber = parseInt(user.nidNumber, 10);
  }

  // Hash password if modified
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, Number(config.salt_rounds));
  }

  // Enforce role-based conditions
  if (user.role === "agent") {
    user.isVerified = false; // Agents are not verified by default
    user.balance = 100000; // Default balance for agents
  } else if (user.role === "user") {
    user.balance = 40; // Default balance for regular users
  }

  next();
});

// Create the Mongoose model
export const User = model<TUser>("User", userSchema);
