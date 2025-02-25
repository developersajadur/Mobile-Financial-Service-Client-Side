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

export const transactionRoute = router;
