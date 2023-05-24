import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HashPasswordService } from './hashPassword.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Token } from '../entities/token.entity';
import { AuthRepository } from './auth.repository';

@Module({
  controllers: [AuthController],
  providers: [AuthService, HashPasswordService, AuthRepository],
  imports: [ConfigModule, TypeOrmModule.forFeature([User, Token])],
})
export class AuthModule {}
