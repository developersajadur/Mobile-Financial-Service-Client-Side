import status from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { userService } from './user.service';

const createUserIntoDb = catchAsync(async (req, res) => {
  const user = await userService.createUserIntoDb(req?.body);
  const responseData = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    isVerified: user.isVerified,
    isBlocked: user.isBlocked,
    balance: user.balance,
    nidNumber: user.nidNumber,
  };
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'WOW! Registration successful',
    data: responseData,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers(req?.query);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: users,
  });
});

const getUsersCount = catchAsync(async (req, res) => {
  const users = await userService.getUsersCount();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Users length retrieved successfully',
    data: users,
  });
});

const getUserById = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'User retrieved successfully',
    data: user,
  });
});

const getApprovalRequestAgent = catchAsync(async (req, res) => {
  const agent = await userService.getApprovalRequestAgent();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Agents retrieved successfully',
    data: agent,
  });
});

const updateUserStatus = catchAsync(async (req, res) => {
  const userId = req.params.id as string;
  const { isBlocked } = req.body;

  const result = await userService.updateUserStatus(userId, isBlocked);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: `User has been ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
    data: result,
  });
});

const approveUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const approvedUser = await userService.approveUser(id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'User approved successfully!',
    data: approvedUser,
  });
});

export const userController = {
  createUserIntoDb,
  getAllUsers,
  getUsersCount,
  getUserById,
  updateUserStatus,
  getApprovalRequestAgent,
  approveUser,
};
