import {
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  HeadObjectCommand,
  HeadObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { AWS_BUCKET_NAME } from "../../config/index.ts";
import { awsConfig } from "./index.ts";

export const s3Client = new S3Client({
  ...awsConfig,
  maxAttempts: 3,
});

/**
 * This function is used to delete an object from the S3 bucket if it exists
 * @function deleteObjectIfExist
 * @param filename: string
 * @returns Promise<void>
 */

export const deleteObjectIfExist = (filename: string) => {
  const params: HeadObjectCommandInput = {
    Bucket: AWS_BUCKET_NAME,
    Key: filename,
  };

  const cmd: HeadObjectCommand = new HeadObjectCommand(params);

  s3Client.send(cmd, async (error) => {
    if (error && error.code == "NotFound") {
      return;
    } else {
      const params: DeleteObjectCommandInput = {
        Bucket: AWS_BUCKET_NAME,
        Key: filename,
      };

      const cmd = new DeleteObjectCommand(params);
      await s3Client.send(cmd);
    }
  });
};
