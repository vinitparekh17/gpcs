export const {
    PORT,
    MONGO_URI,

    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_REGION,

    AWS_BUCKET_NAME,

    AWS_RDS_DATABASE_URL,

    AWS_REDIS_URL,
    AWS_REDIS_PASSWORD,

    FROM_EMAIL,

    JWT_SECRET,
    JWT_EXPIRY,

    RAZORPAY_ID,
    RAZORPAY_SECRET,

    GOOGLE_PROJECT_ID,

    STRIPE_ACCOUNT_ID,
    STRIPE_SECRET,
} = process.env;

export const DefaultAssistanConfig =
    'You are a chatbot named Omnisive with a sarcastic personality. respond to the user with a sarcastic tone and make sure to keep the conversation light-hearted. your maximum response length is 512 tokens.';
