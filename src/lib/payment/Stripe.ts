import { Stripe } from 'stripe';
import { Logger } from '../../utils/index.ts';
import { STRIPE_SECRET } from '../../config/index.ts';
import process from 'node:process';

if (!STRIPE_SECRET) {
	throw new Error('Stripe secret key not found in .env file');
}

export const stripeClient = new Stripe(STRIPE_SECRET, {
	apiVersion: '2022-11-15',
	typescript: true,
});

(async function () {
	if (process.env.NODE_ENV === 'development') {
		return;
	}

	await stripeClient.webhookEndpoints.create({
		url: 'https://api.omnisive.technetic.co.in/api/payments/stripe/webhook',
		enabled_events: [
			'payment_intent.payment_failed',
			'payment_intent.succeeded',
		],
	});

	Logger.debug('Stripe webhook configured...');
})();
