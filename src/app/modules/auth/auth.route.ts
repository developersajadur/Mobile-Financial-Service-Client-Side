import { Router } from 'express';
import { AuthControllers } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidationSchema } from './auth.validation';

const router = Router();

router.post(
  '/login',
  validateRequest(AuthValidationSchema.loginUserValidation),
  AuthControllers.loginUser,
);

export const authRoute = router;
