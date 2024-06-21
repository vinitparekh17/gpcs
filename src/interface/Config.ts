type Config = {
    PORT: string;

    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_REGION: string;

    AWS_BUCKET_NAME: string;

    AWS_RDS_DATABASE_URL: string;

    AWS_REDIS_URL: string;
    AWS_REDIS_PASSWORD: string;

    FROM_EMAIL: string;

    JWT_SECRET: string;
    JWT_EXPIRY: string;

    RAZORPAY_ID: string;
    RAZORPAY_SECRET: string;

    GOOGLE_PROJECT_ID: string;
    GOOGLE_REGION: string;

    STRIPE_ACCOUNT_ID: string;
    STRIPE_SECRET: string;
};
