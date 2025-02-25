import { Router } from 'express';
import { authRoute } from '../modules/auth/auth.route';
import { userRoute } from '../modules/user/user.route';
import { transactionRoute } from '../modules/transaction/transaction.route';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/transactions',
    route: transactionRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
