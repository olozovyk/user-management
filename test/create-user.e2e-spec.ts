import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { UserService } from '@modules/user/services';
import { IUser } from '@modules/user/types';
import { initTestingApp } from './utils';
import { createUserRequest } from './supertest-api';
import { createUserTestDto } from './create-user-test-dto';

describe('POST auth/signup - create user - e2e', () => {
  let app: INestApplication<App>;
  let userService: UserService;

  beforeAll(async () => {
    const { app: _app, moduleRef } = await initTestingApp();
    app = _app;
    userService = moduleRef.get<UserService>(UserService);
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

  it('should create user not returning a password - success', async () => {
    const res = await createUserRequest(app, createUserTestDto);
    expect(res.status).toBe(201);

    const { user } = res.body as { user: IUser };
    expect(user.email).toBe(createUserTestDto.email);
    expect(user).not.toHaveProperty('password');
  });

  it('should throw email in use - error', async () => {
    await createUserRequest(app, createUserTestDto);
    await createUserRequest(app, createUserTestDto).expect(400);
  });

  it('should throw a validation error - required field - error', async () => {
    const createUserDtoWithoutFirstName = {
      ...createUserTestDto,
      firstName: undefined,
    };
    // @ts-expect-error - to have ability to pass firstName undefined value:
    await createUserRequest(app, createUserDtoWithoutFirstName).expect(400);
  });

  it('should throw a validation error - wrong email format - error', async () => {
    const createUserDtoWithWrongEmail = {
      ...createUserTestDto,
      email: 'email',
    };

    await createUserRequest(app, createUserDtoWithWrongEmail).expect(400);
  });
});
