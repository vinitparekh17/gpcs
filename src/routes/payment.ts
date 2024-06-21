import { Router } from 'express';

import {
    RazorPay,
    StripeWebhook,
    CreateStripePaymentIntent,
    SendEmailOnPaymentCapture,
} from '../controllers/paymentController';

import passport from 'passport';

const paymentRouter = Router();

paymentRouter.route('/stripe/webhook').post(StripeWebhook);

paymentRouter.use(passport.authenticate('jwt', { session: false }));

paymentRouter.route('/razorpay').post(RazorPay);
paymentRouter.route('/razorpay/email').post(SendEmailOnPaymentCapture);

paymentRouter.route('/stripe/create').post(CreateStripePaymentIntent);

export default paymentRouter;
