import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../../common/entities/user.entity';
import { Token } from '../../common/entities/token.entity';
import { AuthRepository } from './auth.repository';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Token]),
    forwardRef(() => UsersModule),
    JwtModule.register({}),
  ],
  exports: [AuthService],
})
export class AuthModule {}
