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

export const transactionController = {
    createDepositTransactionIntoDb,
    createTransferTransactionIntoDb,
    createWithdrawTransactionIntoDb,
};
