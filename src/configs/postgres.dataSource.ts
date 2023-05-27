import { DataSource } from 'typeorm';
import { postgresConfig } from './postgres.config';

const postgresDataSource = new DataSource({
  ...postgresConfig,
  entities: ['*/**/*.entity.ts'],
  migrations: ['*/migrations/*.ts'],
});

export default postgresDataSource;
