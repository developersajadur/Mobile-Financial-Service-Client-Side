/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload } from 'jsonwebtoken';
import { TJwtPayload } from './auth.service';
import config from '../../config';
import { Request, Response } from 'express';
import AppError from '../../errors/AppError';
import status from 'http-status';
export const createToken = (
  jwtPayload: TJwtPayload,
  secret: string,
  expiresIn: any,
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn: expiresIn,
  });
};
export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const tokenDecoder = (req: Request) => {
  const token = req?.headers?.authorization;
  // console.log(token);
  if (!token) {
    throw new AppError(status.UNAUTHORIZED, 'You Are Not Authorized');
  }
  const decoded = verifyToken(
    token as string,
    config.jwt_token_secret as string,
  );
  return decoded;
};
