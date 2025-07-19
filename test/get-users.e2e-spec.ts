import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { IPublicUser } from '@modules/user/types';
import { initTestingApp } from './utils';
import { UserService } from '@modules/user/services';
import { createUserRequest } from './supertest-api';
import { createUserTestDto } from './create-user-test-dto';

describe('GET /users - e2e', () => {
  let app: INestApplication<App>;
  let userService: UserService;

  beforeAll(async () => {
    const { app: _app, moduleRef } = await initTestingApp();
    app = _app;
    userService = moduleRef.get(UserService);
  });

  afterEach(async () => {
    const user = await userService.getUserByEmail(createUserTestDto.email);
    if (user) {
      await userService.deleteUser(user.id);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it("/public/users (GET) 200 - success (should return user's array)", async () => {
    const res = await request(app.getHttpServer()).get('/public/users/');
    expect(res.status).toBe(200);
    const { users } = res.body as { users: IPublicUser[] };
    expect(Array.isArray(users)).toBeTruthy();
  });

  it('/public/users (GET) - should not return private fields', async () => {
    const userRes = await createUserRequest(app, createUserTestDto);
    const {
      user: { id },
    } = userRes.body as { user: IPublicUser };

    const res = await request(app.getHttpServer()).get(`/public/users/${id}`);
    const { user } = res.body as { user: IPublicUser };

    expect(user).toHaveProperty('id');

    expect(user).not.toHaveProperty('email');
    expect(user).not.toHaveProperty('verifiedEmail');
    expect(user).not.toHaveProperty('password');
    expect(user).not.toHaveProperty('role');
    expect(user).not.toHaveProperty('tokens');
  });
});
