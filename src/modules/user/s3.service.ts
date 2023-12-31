import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  constructor(private configService: ConfigService) {}

  private client = new S3Client({
    region: this.configService.getOrThrow('REGION'),
    credentials: {
      accessKeyId: this.configService.getOrThrow('AWS_ID'),
      secretAccessKey: this.configService.getOrThrow('AWS_KEY'),
    },
  });

  public async sendFile(file: Buffer, key: string): Promise<void> {
    const input = {
      Body: file,
      Bucket: this.configService.getOrThrow('BUCKET'),
      Key: key,
    };
    const command = new PutObjectCommand(input);

    await this.client.send(command);
  }
}
