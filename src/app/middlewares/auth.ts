/* eslint-disable @typescript-eslint/no-explicit-any */
import status from 'http-status';
import AppError from '../errors/AppError';
import catchAsync from '../utils/catchAsync';
import { tokenDecoder } from '../modules/auth/auth.utils';
import { User } from '../modules/user/user.model';
import { TUserRole } from '../modules/user/user.interface';
import { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decoded = tokenDecoder(req);
    const { role, userId } = decoded;
    const user: any = await User.findById(userId);
    if (!user) {
      throw new AppError(status.UNAUTHORIZED, 'User not found!');
    }
    if (user.isBlocked) {
      throw new AppError(status.FORBIDDEN, 'User is blocked!');
    }
    if (!user.isVerified) {
      throw new AppError(status.UNAUTHORIZED, 'User is not verified');
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(status.UNAUTHORIZED, 'You are not authorized!');
    }
    (req as any).user = decoded as JwtPayload & { role: string };
    //  ( req as any).user = user;
    next();
  });
};

export default auth;
