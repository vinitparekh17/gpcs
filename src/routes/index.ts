import { Router } from "express";

const router = Router();

import healthRouter from "./health.ts";
import userRouter from "./user.ts";
import adminRouter from "./admin.ts";
import paymentRouter from "./payment.ts";
import chatRouter from "./chat.ts";

router.use("/health", healthRouter);
router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/chat", chatRouter);
router.use("/payments", paymentRouter);

export default router;
