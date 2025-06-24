import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from './services';
import { UserRepository } from './user.repository';
import { UserController, PublicUser } from './controllers';
import { S3Service } from './services/s3.service';
import { Avatar, UserEntity, Vote } from '@modules/user/entities';

@Module({
  providers: [UserService, UserRepository, S3Service],
  exports: [UserService],
  controllers: [PublicUser, UserController],
  imports: [ConfigModule, TypeOrmModule.forFeature([UserEntity, Vote, Avatar])],
})
export class UserModule {}
