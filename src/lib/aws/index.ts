import { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from "../../config/index.ts";

export const awsConfig = { 
    region: AWS_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: AWS_SECRET_ACCESS_KEY ?? "",
    }
};