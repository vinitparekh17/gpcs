import cors from 'cors';

const corsConfig = cors({
	origin: [
		'http://localhost:3000',
		'https://omnisive.technetic.co.in',
		'https://admin.omnisive.technetic.co.in',
	],
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	optionsSuccessStatus: 200,
	credentials: true,
});

export { corsConfig };
