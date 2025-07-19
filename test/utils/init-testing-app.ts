import { Test } from '@nestjs/testing';
import { AppModule } from '@modules/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';

export const initTestingApp = async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app: INestApplication<App> = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  await app.init();

  return {
    app,
    moduleRef,
  };
};
