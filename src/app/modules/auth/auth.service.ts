/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import status from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import { createToken } from './auth.utils';
import config from '../../config';

export type TJwtPayload = {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: number;
  role: string;
};

const loginUser = async (
  payload: TLoginUser,
  req: any,
): Promise<{ token: string }> => {
  const user = await User.findOne({ phoneNumber: payload?.phoneNumber }).select(
    '+password',
  );
  if (!user) throw new AppError(status.NOT_FOUND, 'User Not Found');
  if (user.isBlocked) throw new AppError(status.FORBIDDEN, 'User Is Blocked');

  const passwordMatch = await bcrypt.compare(payload.password, user.password);
  if (!passwordMatch)
    throw new AppError(status.UNAUTHORIZED, 'Invalid password!');

  // Generate device fingerprint
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  const deviceFingerprint = crypto
    .createHash('sha256')
    .update(`${ip}-${userAgent}`)
    .digest('hex');

  // If user is already logged in from another device, deny login
  if (user.deviceFingerprint && user.deviceFingerprint !== deviceFingerprint) {
    throw new AppError(
      status.FORBIDDEN,
      'You are already logged in from another device.',
    );
  }

  // Generate JWT token
  const jwtPayload = {
    userId: user._id.toString(),
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    email: user.email,
    role: user.role,
  };
  const token = createToken(
    jwtPayload,
    config.jwt_token_secret as string,
    config.jwt_token_expires_in as any,
  );

  // Store the new device fingerprint in the database
  await User.findByIdAndUpdate(user._id, { deviceFingerprint });

  return { token };
};

const logout = async (number: string) => {
  const user = await User.findOneAndUpdate(
    { phoneNumber: number },
    { deviceFingerprint: null },
  ); 
  if (!user) {
    throw new AppError(status.NOT_FOUND, 'User not found');
  }

  if (user.role !== 'admin') {
    user.deviceFingerprint = null;
    await user.save();
  }
};



const getUserFingerprint = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(status.NOT_FOUND, 'User not found');
  }

  return user.deviceFingerprint;
}



export const AuthServices = { loginUser, logout, getUserFingerprint };
