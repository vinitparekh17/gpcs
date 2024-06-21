import { Router } from 'express';

const router = Router();

import healthRouter from './health';
import userRouter from './user';
import adminRouter from './admin';
import paymentRouter from './payment';
import chatRouter from './chat';

router.use('/health', healthRouter);
router.use('/user', userRouter);
router.use('/admin', adminRouter);
router.use('/chat', chatRouter);
router.use('/payments', paymentRouter);

export default router;
