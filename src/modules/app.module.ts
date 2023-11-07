import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { postgresConfig } from '../common/configs';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { HealthcheckModule } from './healthcheck/healthcheck.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({ ...postgresConfig }),
    AuthModule,
    UserModule,
    HealthcheckModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
