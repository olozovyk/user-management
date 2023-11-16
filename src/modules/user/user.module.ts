import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { UserController } from './user.controller';
import { S3Service } from './s3.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avatar, User, Vote } from '@modules/user/entities';

@Module({
  providers: [UserService, UserRepository, S3Service],
  exports: [UserService],
  controllers: [UserController],
  imports: [ConfigModule, TypeOrmModule.forFeature([User, Vote, Avatar])],
})
export class UserModule {}
