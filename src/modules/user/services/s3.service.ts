import { Injectable, Logger } from '@nestjs/common';
import {
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  constructor(private readonly configService: ConfigService) {}

  private readonly logger = new Logger(S3Service.name);

  // private client = new S3Client({
  //   region: 'eu-central-1',
  //   credentials: {
  //     accessKeyId: this.configService.getOrThrow('ACCESS_KEY'),
  //     secretAccessKey: this.configService.getOrThrow('SECRET_ACCESS_KEY'),
  //   },
  // });

  private get client() {
    return new S3Client({
      region: 'eu-central-1',
      credentials: {
        accessKeyId: this.configService.getOrThrow('ACCESS_KEY'),
        secretAccessKey: this.configService.getOrThrow('SECRET_ACCESS_KEY'),
      },
    });
  }

  public async sendFile(
    file: Buffer,
    key: string,
  ): Promise<PutObjectCommandOutput | undefined> {
    const input = {
      Body: file,
      Bucket: this.configService.getOrThrow<string>('BUCKET'),
      Key: key,
    };
    const command = new PutObjectCommand(input);

    try {
      return await this.client.send(command);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
