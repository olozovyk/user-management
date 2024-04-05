import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { UserModule } from '@modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '@modules/auth/entities';
import { EmailService } from './email.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, EmailService],
  imports: [
    ConfigModule,
    UserModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([Token]),
  ],
  exports: [AuthService],
})
export class AuthModule {}
