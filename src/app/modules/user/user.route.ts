import { Router } from 'express';
import { userController } from './user.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { userValidationSchema } from './user.validation';

const router = Router();

router.post(
  '/register',
  validateRequest(userValidationSchema.createUserValidation),
  userController.createUserIntoDb,
);
router.get('/', auth(USER_ROLE.admin), userController.getAllUsers);

router.get('/count', auth(USER_ROLE.admin), userController.getUsersCount);

router.get(
  '/approval-request',
  auth(USER_ROLE.admin),
  userController.getApprovalRequestAgent,
);

router.patch(
  '/:id/status',
  auth(USER_ROLE.admin),
  userController.updateUserStatus,
);

router.patch('/:id/approve', auth(USER_ROLE.admin), userController.approveUser);

router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.agent, USER_ROLE.user),
  userController.getUserById,
);

export const userRoute = router;
