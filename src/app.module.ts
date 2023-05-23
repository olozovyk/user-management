import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { postgresConfig } from './configs/postgres.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(postgresConfig),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
