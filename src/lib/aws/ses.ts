import * as aws from "@aws-sdk/client-ses";
import { createTransport } from "nodemailer";
import { Logger } from "../../utils/index.ts";
import {FROM_EMAIL} from "../../config/index.ts";
import { EmailFormat } from "../../types/index.ts";
import { awsConfig } from "./index.ts";

const ses = new aws.SES(awsConfig);

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
      const email = await EmailService.transporter.sendMail(
        {
          from: FROM_EMAIL,
          ...emailData,
        });

      Logger.info(`Email sent: ${email.messageId}`);
      return true;
    } catch (error) {
      if (error instanceof Error) {
      Logger.error(error.message);
      return false;
    } else {
      Logger.error("Error sending email");
      return false;
    }
    }
  }
}
