import { Router } from "express";

import {
  CreateStripePaymentIntent,
  RazorPay,
  SendEmailOnPaymentCapture,
  StripeWebhook,
} from "../controllers/paymentController.ts";

import passport from "passport";

const paymentRouter = Router();

paymentRouter.route("/stripe/webhook").post(StripeWebhook);

paymentRouter.use(passport.authenticate("jwt", { session: false }));

paymentRouter.route("/razorpay").post(RazorPay);
paymentRouter.route("/razorpay/email").post(SendEmailOnPaymentCapture);

paymentRouter.route("/stripe/create").post(CreateStripePaymentIntent);

export default paymentRouter;
