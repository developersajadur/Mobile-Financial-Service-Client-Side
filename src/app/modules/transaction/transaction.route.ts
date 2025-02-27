import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { transactionValidationSchema } from './transaction.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { transactionController } from './transaction.controller';

const router = Router();

router.post(
  '/make-deposit-transaction',
  auth(USER_ROLE.agent),
  validateRequest(transactionValidationSchema.createTransactionValidation),
  transactionController.createDepositTransactionIntoDb,
);

router.post(
  '/make-transfer-transaction',
  auth(USER_ROLE.user),
  validateRequest(transactionValidationSchema.createTransactionValidation),
  transactionController.createTransferTransactionIntoDb,
);

router.post(
  '/make-withdraw-transaction',
  auth(USER_ROLE.user),
  validateRequest(transactionValidationSchema.createTransactionValidation),
  transactionController.createWithdrawTransactionIntoDb,
);

router.get(
  '/count',
  auth(USER_ROLE.admin),
  transactionController.getTransactionCount,
);

router.get(
  '/my-transactions',
  auth(USER_ROLE.user, USER_ROLE.agent),
  transactionController.getMyTransactions,
);

router.get(
  '/users/:id',
  auth(USER_ROLE.admin),
  transactionController.getTransactionsDetailsById,
);

router.get(
  '/',
  auth(USER_ROLE.admin),
  transactionController.getAllTransactionsFromDb,
);

export const transactionRoute = router;
