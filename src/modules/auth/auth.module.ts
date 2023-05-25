import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Token } from '../../entities/token.entity';
import { AuthRepository } from './auth.repository';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Token]),
    UsersModule,
    JwtModule.register({}),
  ],
})
export class AuthModule {}
