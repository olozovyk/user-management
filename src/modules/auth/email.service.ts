import { Injectable, Logger } from '@nestjs/common';
import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
  SendEmailCommandOutput,
} from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private client = new SESClient({
    region: 'eu-central-1',
  });

  public async send(
    from: string,
    to: string,
    message: string,
  ): Promise<SendEmailCommandOutput | undefined> {
    const input = {
      Source: from,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: { Data: 'Email verification', Charset: 'UTF-8' },
        Body: {
          Text: {
            Data: message,
            Charset: 'UTF-8',
          },
        },
      },
    } satisfies SendEmailCommandInput;

    try {
      const command = new SendEmailCommand(input);
      return this.client.send(command);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
