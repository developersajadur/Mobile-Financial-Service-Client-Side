/* eslint-disable @typescript-eslint/no-explicit-any */
import status from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';
import bcrypt from 'bcrypt';
import { createToken } from './auth.utils';
import config from '../../config';

export type TJwtPayload = {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: number;
  role: string;
};

const loginUser = async (payload: TLoginUser): Promise<{ token: string }> => {
  const user = await User.findOne({ phoneNumber: payload?.phoneNumber }).select(
    '+password',
  );
  if (!user) {
    throw new AppError(status.NOT_FOUND, 'User Not Found');
  } else if (user?.isBlocked) {
    throw new AppError(status.FORBIDDEN, 'User Is Blocked');
  }
  const passwordMatch = await bcrypt.compare(payload?.password, user?.password);
  if (!passwordMatch) {
    throw new AppError(status.UNAUTHORIZED, 'Invalid password!');
  }

  const jwtPayload = {
    userId: user?._id.toString(),
    fullName: user.fullName,
    phoneNumber: user?.phoneNumber,
    email: user?.email,
    role: user?.role,
  };

  const token = createToken(
    jwtPayload,
    config.jwt_token_secret as string,
    config.jwt_token_expires_in as any,
  );

  return { token };
};

export const AuthServices = {
  loginUser,
};
