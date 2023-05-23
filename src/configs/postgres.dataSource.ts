import { DataSource } from 'typeorm';
import { postgresConfig } from './postgres.config';

const postgresDataSource = new DataSource({
  ...postgresConfig,
  entities: ['*/**/*.entity.ts'],
  migrations: ['*/migrations/*.ts'],
});

// postgresDataSource
//   .initialize()
//   .then(() => {
//     console.log('Data Source has been initialized!');
//   })
//   .catch(err => {
//     console.error('Error during Data Source initialization', err);
//   });

export default postgresDataSource;
