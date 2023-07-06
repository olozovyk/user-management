import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';
import { S3Service } from './s3.service';

@Module({
  providers: [UsersService, UsersRepository, S3Service],
  exports: [UsersService, UsersRepository],
  controllers: [UsersController],
  imports: [ConfigModule],
})
export class UsersModule {}
