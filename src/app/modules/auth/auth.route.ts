import { Router } from 'express';
import { AuthControllers } from './auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidationSchema } from './auth.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';

const router = Router(); 

router.post(
  '/login',
  validateRequest(AuthValidationSchema.loginUserValidation),
  AuthControllers.loginUser,
);

router.post('/logout', AuthControllers.logout)

router.get('/get-fingerprint', auth(USER_ROLE.user, USER_ROLE.agent, USER_ROLE.admin), AuthControllers.getUserFingerprint)

router.get('/get-fingerprint-for-matching', auth(USER_ROLE.user, USER_ROLE.agent, USER_ROLE.admin), AuthControllers.makeDeviceFingerprint)

export const authRoute = router;
