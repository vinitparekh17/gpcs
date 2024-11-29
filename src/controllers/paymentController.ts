import type { Request, Response } from 'express';
import { stripeClient } from '../lib/payment/Stripe';
import { AsyncHandler } from '../handlers';
import { RazorpayClient } from '../lib/payment/Razorpay';
import type { INormalizeError } from 'razorpay/dist/types/api';
import { Err, Logger, Success } from '../utils';
import EmailService from '../lib/aws/ses';
import { PaymentSuccessTemplate } from '../utils/Template';
import { STRIPE_SECRET, STRIPE_ACCOUNT_ID } from '../config';

export const CreateStripePaymentIntent = AsyncHandler(
    async (req: Request, res: Response): Promise<Response> => {
        const { amount } = req.body;

        const paymentIntent = await stripeClient.paymentIntents.create(
            {
                amount: parseInt(amount) * 100,
                currency: 'inr',
                payment_method_types: ['card'],
                setup_future_usage: 'off_session',
                receipt_email: req.user.email,
            },
            {
                apiKey: STRIPE_SECRET,
                stripeAccount: STRIPE_ACCOUNT_ID,
            }
        );
        return Success.send(res, 200, paymentIntent.client_secret);
    }
);

export const StripeWebhook = AsyncHandler((req: Request, res: Response): Response => {
    const event = req.body;
    if (event.type == 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log(paymentIntent);
    }

    return Success.send(res, 200, 'Webhook received');
});

export const RazorPay = AsyncHandler(async (req: Request, res: Response): Promise<Response> => {
    const { amount } = req.body;
    try {
        const order = await RazorpayClient.orders.create({
            amount: parseInt(amount) * 100,
            currency: 'INR',
            method: 'upi',
            receipt: `order_rcptid_${Math.floor(Math.random() * 1000)}`,
        });
        return Success.send(res, 201, order);
    } catch (err: unknown) {
        if (isNormalizeError(err)) {
            const reason = err.error.reason;
            Logger.error(reason);
            return Err.send(res, 500, reason);
        }
    
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        Logger.error(message);
        return Err.send(res, 500, message);
    }
    
});

function isNormalizeError(err: unknown): err is INormalizeError {
    return (
        typeof err === 'object' &&
        err !== null &&
        'error' in err &&
        typeof (err as INormalizeError).error?.reason === 'string'
    );
}

export const SendEmailOnPaymentCapture = AsyncHandler(
    (req: Request, res: Response) => {
        const { user, amount } = req.body;

        EmailService.sendMail({
            to: user.email,
            subject: 'Payment Successful',
            html: PaymentSuccessTemplate(user.name, amount),
        });
        return Success.send(res, 200, 'Email sent successfully');
    }
);
