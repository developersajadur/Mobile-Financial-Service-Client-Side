import status from 'http-status';
import QueryBuilder from '../../builders/QueryBuilder';
import { userSearchableFields } from './user.constant';
import { TUser } from './user.interface';
import { User } from './user.model';
import AppError from '../../errors/AppError';

const createUserIntoDb = async (user: TUser) => {
  const isUserExist = await User.findOne({ email: user.email });

  if (isUserExist) {
    if (isUserExist.phoneNumber === user.phoneNumber) {
      throw new AppError(
        status.BAD_REQUEST,
        'User with this phone number already exists',
      );
    } else if (isUserExist.email === user.email) {
      throw new AppError(
        status.BAD_REQUEST,
        'User with this email already exists',
      );
    } else if (isUserExist.nidNumber === user.nidNumber) {
      throw new AppError(
        status.BAD_REQUEST,
        'User with this NID number already exists',
      );
    }
  }

  // Assign balance based on user role
  if (user.role === 'agent') {
    user.isVerified = false;
    user.balance = 100000; // Agents get 100,000 BDT
  } else if (user.role === 'user') {
    user.isVerified = true;
    user.balance = 40; // Users get 40 BDT
  }

  // Save user to DB
  const result = await User.create(user);

  // Update Admin's total money
  const admin = await User.findOne({ role: 'admin' });
  if (admin) {
    admin.totalMoney = (admin.totalMoney || 0) + user.balance;
    await admin.save();
  }

  return result;
};

const getAllUsers = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(
    User.find({ role: { $in: ['agent', 'user'] } }),
    query,
  )
    .search(userSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();
  return { result, meta };
};

const getUserById = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(status.NOT_FOUND, 'User Not Found');
  }
  if (user.isBlocked) {
    throw new AppError(status.FORBIDDEN, 'User is blocked');
  }
  return user;
};

const getUsersCount = async () => {
  const totalUsers = await User.countDocuments();
  return { totalUsers };
};

const updateUserStatus = async (userId: string, isBlocked: boolean) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(status.NOT_FOUND, 'User Not Found');
  }
  user.isBlocked = isBlocked;
  await user.save();
  return user;
};

const getApprovalRequestAgent = async () => {
  return await User.find({ role: 'agent', isVerified: false });
};

const approveUser = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(status.NOT_FOUND, 'User not found!');
  }

  if (user.isVerified) {
    throw new AppError(status.BAD_REQUEST, 'User is already approved!');
  }

  user.isVerified = true;
  await user.save();

  return user;
};

export const userService = {
  createUserIntoDb,
  getAllUsers,
  getUsersCount,
  getUserById,
  updateUserStatus,
  getApprovalRequestAgent,
  approveUser,
};
