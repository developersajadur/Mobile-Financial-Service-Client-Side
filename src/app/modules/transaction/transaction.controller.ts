import status from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { tokenDecoder } from '../auth/auth.utils';
import { transactionServices } from './transaction.service';
import sendResponse from '../../utils/sendResponse';

const createDepositTransactionIntoDb = catchAsync(async (req, res) => {
  const decoded = tokenDecoder(req);
  const { userId } = decoded;
  req.body.user = userId;
  const transaction = await transactionServices.createDepositTransactionIntoDb(
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Deposit successful',
    data: transaction,
  });
});

const createTransferTransactionIntoDb = catchAsync(async (req, res) => {
  const decoded = tokenDecoder(req);
  const { userId } = decoded;
  req.body.user = userId;
  const transaction = await transactionServices.createTransferTransactionIntoDb(
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Transfer Money successful',
    data: transaction,
  });
});

const createWithdrawTransactionIntoDb = catchAsync(async (req, res) => {
  const decoded = tokenDecoder(req);
  const { userId } = decoded;
  req.body.user = userId;
  const transaction = await transactionServices.createWithdrawTransactionIntoDb(
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Withdraw Money successful',
    data: transaction,
  });
});

const getTransactionCount = catchAsync(async (req, res) => {
  const transactions = await transactionServices.getTransactionCount();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Transaction length retrieved successfully',
    data: transactions,
  });
});

const getAllTransactionsFromDb = catchAsync(async (req, res) => {
  const transactions = await transactionServices.getAllTransactionsFromDb();
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Transaction retrieved successfully',
    data: transactions,
  });
});

const getMyTransactions = catchAsync(async (req, res) => {
  const decoded = tokenDecoder(req);
  const { userId } = decoded;
  const transactions = await transactionServices.getMyTransactions(userId);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Transaction retrieved successfully',
    data: transactions,
  });
});

const getTransactionsDetailsById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const transactions = await transactionServices.getTransactionsDetailsById(id);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: 'Transaction retrieved successfully',
    data: transactions,
  });
});

export const transactionController = {
  createDepositTransactionIntoDb,
  createTransferTransactionIntoDb,
  createWithdrawTransactionIntoDb,
  getTransactionCount,
  getMyTransactions,
  getAllTransactionsFromDb,
  getTransactionsDetailsById,
};
