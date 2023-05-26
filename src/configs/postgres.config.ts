import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

dotenv.config();

const configService = new ConfigService();

export const postgresConfig: DataSourceOptions = {
  type: 'postgres',
  host: configService.get('POSTGRES_HOST'),
  port: Number(configService.get('POSTGRES_PORT')),
  username: configService.get('POSTGRES_USER_NAME'),
  password: configService.get('POSTGRES_PASSWORD'),
  database: configService.get('POSTGRES_DB_NAME'),
  synchronize: false,
};
