import status from 'http-status';
import config from '../../config';
import crypto from 'crypto';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';
import { tokenDecoder } from './auth.utils';

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body, req);
  const { token } = result;

  res.cookie('token', token, {
    secure: config.node_env === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Logged in successfully!',
    data: { token },
  });
});

const logout = catchAsync(async (req, res) => {
  const {phoneNumber} = req.body;
  await AuthServices.logout(phoneNumber);

  res.clearCookie('token');
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Logged out successfully!',
    data: null,
  });
});



const getUserFingerprint = catchAsync(async (req, res) => { 
  const decoded = tokenDecoder(req);
   const { userId } = decoded;
  const fingerprint = await AuthServices.getUserFingerprint(userId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'User fingerprint retrieved successfully',
    data: fingerprint,
  });
})


const makeDeviceFingerprint = catchAsync(async (req, res) => {
    // Generate device fingerprint
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const deviceFingerprint = crypto
      .createHash('sha256')
      .update(`${ip}-${userAgent}`)
      .digest('hex');

      sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: 'Device fingerprint generated successfully',
        data: deviceFingerprint,
      })
})

export const AuthControllers = { loginUser, logout, getUserFingerprint, makeDeviceFingerprint };
