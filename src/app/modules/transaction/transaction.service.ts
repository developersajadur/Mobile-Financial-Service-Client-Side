import { TTransaction } from './transaction.interface';
import { Transaction } from './transaction.model';
import { User } from '../user/user.model';
import AppError from '../../errors/AppError';
import status from 'http-status';

const createDepositTransactionIntoDb = async (transaction: TTransaction) => {
  const {  type, amount, recipient } = transaction;

//   const userData = await User.findById(user);
  const recipientData = await User.findById(recipient);

  if (!recipientData) {
    throw new AppError(status.NOT_FOUND, 'User not found');
  } else if (!recipientData.isVerified) {
    throw new AppError(status.FORBIDDEN, 'User is not verified');
  } else if (recipientData.isBlocked) {
    throw new AppError(status.FORBIDDEN, 'User is blocked');
  } else if (recipientData.role !== 'user') {
    throw new AppError(status.FORBIDDEN, 'This is not a user');
  }


  if (type !== 'deposit') {
    throw new AppError(status.BAD_REQUEST, 'Invalid transaction type');
  }

  recipientData.balance += amount;
  await recipientData.save();

  const newTransaction = (
    await (await Transaction.create(transaction)).populate('user')
  ).populate('recipient');
  return newTransaction;
};



export const transactionServices = {
  createDepositTransactionIntoDb,
};
