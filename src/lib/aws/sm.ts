import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import process from "node:process";

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

/**
 * This function is used to get the secret value from AWS Secrets Manager
 * @param secretName: string
 * @returns Promise<string>
 * @throws Error
 */
export const getSecret = async (secretName: string): Promise<string> => {
  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await client.send(command);
    return response.SecretString || "";
  } catch (error: unknown) {
    throw new Error(`Error fetching secret: ${error}`);
  }
};
