import { Injectable, Logger } from '@nestjs/common';
import {
  SESClient,
  SendEmailCommand,
  SendEmailCommandInput,
  SendEmailCommandOutput,
} from '@aws-sdk/client-ses';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  private readonly logger = new Logger(EmailService.name);

  // private client = new SESClient({
  //   region: 'eu-central-1',
  //   credentials: {
  //     accessKeyId: this.configService.getOrThrow('ACCESS_KEY'),
  //     secretAccessKey: this.configService.getOrThrow('SECRET_ACCESS_KEY'),
  //   },
  // });

  private get client() {
    return new SESClient({
      region: 'eu-central-1',
      credentials: {
        accessKeyId: this.configService.getOrThrow('ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow('SECRET_ACCESS_KEY'),
      },
    });
  }

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

    const command = new SendEmailCommand(input);
    return this.client.send(command);
  }
}
