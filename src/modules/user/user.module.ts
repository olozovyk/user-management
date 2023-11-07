import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserController } from './user.controller';
import { S3Service } from './s3.service';

@Module({
  providers: [UserService, UserRepository, S3Service],
  exports: [UserService],
  controllers: [UserController],
  imports: [ConfigModule],
})
export class UserModule {}
