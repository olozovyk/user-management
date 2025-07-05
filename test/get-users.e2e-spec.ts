import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@modules/app.module';
import { IPublicUser } from '@modules/user/types';

describe('Users e2e', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/public/users/ (GET) 200 - success (should return user's array)", async () => {
    const res = await request(app.getHttpServer()).get('/public/users/');
    expect(res.status).toBe(200);
    const { users } = res.body as { users: IPublicUser[] };
    expect(Array.isArray(users)).toBeTruthy();
  });
});
