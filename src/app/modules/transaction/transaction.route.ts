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

export const transactionRoute = router;
