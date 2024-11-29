import * as aws from '@aws-sdk/client-ses';
import { createTransport } from 'nodemailer';
import { Logger } from '../../utils';
import {
    AWS_REGION,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    FROM_EMAIL,
} from '../../config';
import { EmailFormat } from '../../types';

const ses = new aws.SES({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * This class is used to send email using AWS SES
 * @class EmailService
 * @method sendMail
 * @param emailData: EmailFormat
 * @returns Promise<boolean>
 * @throws Error
 */

export default class EmailService {
    private static transporter = createTransport({
        SES: { ses, aws },
    });

    public static async sendMail(emailData: EmailFormat): Promise<boolean> {
        try {
            EmailService.transporter.sendMail(
                {
                    from: FROM_EMAIL,
                    ...emailData,
                },
                (err) => {
                    if (err) {
                        Logger.error(err.message);
                    }
                }
            );
            return true;
        } catch (error) {
            Logger.error(error.message);
            return false;
        }
    }
}
