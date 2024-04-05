import { Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  constructor(private readonly configService: ConfigService) {}

  private readonly logger = new Logger(S3Service.name);

  private client = new S3Client({});

  public async sendFile(file: Buffer, key: string): Promise<void> {
    const input = {
      Body: file,
      Bucket: this.configService.getOrThrow('BUCKET'),
      Key: key,
    };
    const command = new PutObjectCommand(input);

    try {
      await this.client.send(command);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
