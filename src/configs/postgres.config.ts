import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getPostgresConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  return {
    type: 'postgres',
    host: configService.get('POSTGRES_HOST'),
    port: Number(configService.get('POSTGRES_PORT')),
    username: configService.get('POSTGRES_USER_NAME'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DB_NAME'),
    synchronize: false,
    entities: [],
    subscribers: [],
    migrations: [],
  };
};
