import {
    S3Client,
    HeadObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommandInput,
    DeleteObjectCommandInput,
} from '@aws-sdk/client-s3';
import {
    AWS_ACCESS_KEY_ID,
    AWS_BUCKET_NAME,
    AWS_REGION,
    AWS_SECRET_ACCESS_KEY,
} from '../../config';

export const s3Client = new S3Client({
    region: AWS_REGION,
    maxAttempts: 3,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * This function is used to delete an object from the S3 bucket if it exists
 * @function deleteObjectIfExist
 * @param filename: string
 * @returns Promise<void>
 */

export const deleteObjectIfExist = async (filename: string) => {
    const params: HeadObjectCommandInput = {
        Bucket: AWS_BUCKET_NAME,
        Key: filename,
    };

    const cmd: HeadObjectCommand = new HeadObjectCommand(params);

    s3Client.send(cmd, async (error) => {
        if (error && error.code == 'NotFound') {
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
