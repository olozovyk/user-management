import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '@modules/app.module';
import { UserService } from '@modules/user/user.service';
import { TestApi } from './api/test-api';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let usersService: UserService;
  const testApi = TestApi.getInstance();

  let user: request.Response | null;
  let secondUser: request.Response | null;

  const uuidSplit = () => uuidv4().slice(0, 10);

  const createUserDtoWithoutPassword = {
    nickname: `Test_${uuidSplit()}`,
    firstName: 'Test',
    lastName: 'Test',
  };

  const createUserDto = {
    ...createUserDtoWithoutPassword,
    password: uuidSplit(),
  };

  const secondUserDto = {
    ...createUserDto,
    nickname: createUserDto.nickname + '_',
  };

  const loginUserDto = {
    nickname: createUserDto.nickname,
    password: createUserDto.password,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    usersService = moduleFixture.get<UserService>(UserService);
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    testApi.app = app;
  });

  afterEach(async () => {
    const userId = user?.body.user.id;
    if (userId) {
      await usersService.deleteUser(userId);
      user = null;
    }

    const secondUserId = secondUser?.body.user.id;

    if (secondUserId) {
      await usersService.deleteUser(secondUserId);
      secondUser = null;
    }

    await app.close();
  });

  it('/users/ (GET) 200 - success (users array received)', async () => {
    const users = await testApi.getUsers().expect(200);
    expect(Array.isArray(users.body.users)).toBeTruthy();
  });

  it('/auth/signup/ (POST) 400 - fail (not unique nickname)', async () => {
    user = await testApi.createUser(createUserDto);
    await testApi.createUser(createUserDto).expect(400);
  });

  it('/auth/signup/ (POST) 400 - fail (password is absent)', async () => {
    await testApi.createUser(createUserDtoWithoutPassword).expect(400);
  });

  it('/auth/signup/ (POST) 201 - success', async () => {
    user = await testApi.createUser(createUserDto).expect(201);
  });

  it('/auth/login/ (POST) 400 - fail (password is not correct)', async () => {
    user = await testApi.createUser(createUserDto);

    await testApi
      .login({
        ...loginUserDto,
        password: loginUserDto.password + '_',
      })
      .expect(400);
  });

  it('/auth/login/ (POST) 200 - success', async () => {
    user = await testApi.createUser(createUserDto);
    const loggedUser = await testApi.login(loginUserDto).expect(200);
    expect(loggedUser.body.token).toBeTruthy();
  });

  it(`/users/:id/ (PATCH) 403 - fail (user's attempt to change another user)`, async () => {
    user = await testApi.createUser(createUserDto);
    secondUser = await testApi.createUser(secondUserDto);

    const loggedUser = await testApi.login(loginUserDto);
    const token = loggedUser.body.token;

    const lastModified = secondUser.headers['last-modified'];
    const userId = secondUser.body.user.id;

    await testApi
      .editUser({
        userId,
        editUserDto: { firstName: createUserDto.firstName + '_' },
        lastModified,
        token: token,
      })
      .expect(403);
  });

  it('/users/:id/ (PATCH) 404 - fail (user is not found)', async () => {
    user = await testApi.createUser(createUserDto);
    const loggedUser = await testApi.login(loginUserDto);

    const token = loggedUser.body.token;
    const lastModified = user.headers['last-modified'];

    await testApi
      .editUser({
        userId: uuidv4(),
        editUserDto: { firstName: createUserDto.firstName + '_' },
        lastModified,
        token: token,
      })
      .expect(404);
  });

  it(`/users/:id/ (PATCH) 403 - fail (user is trying to change role)`, async () => {
    user = await testApi.createUser(createUserDto);
    const loggedUser = await testApi.login(loginUserDto);

    const token = loggedUser.body.token;
    const lastModified = user.headers['last-modified'];

    await testApi
      .editUser({
        userId: loggedUser.body.user.id,
        editUserDto: { role: 'moderator' },
        lastModified,
        token: token,
      })
      .expect(403);
  });

  it('/users/:id/ (PATCH) 200 - success (first name is changed)', async () => {
    user = await testApi.createUser(createUserDto);
    const loggedUser = await testApi.login(loginUserDto);

    const token = loggedUser.body.token;
    const lastModified = user.headers['last-modified'];
    const userId = loggedUser.body.user.id;

    await testApi.editUser({
      userId,
      editUserDto: { firstName: createUserDto.firstName + '_' },
      lastModified,
      token,
    });

    const changedFirsName = (await testApi.getUserById(userId)).body.user
      .firstName;

    expect(changedFirsName).not.toBe(createUserDto.nickname);
  });

  it('/users/:id (DELETE) 404 - fail (user is not found)', async () => {
    user = await testApi.createUser(createUserDto);
    const loggedUser = await testApi.login(loginUserDto);
    const token = loggedUser.body.token;

    await testApi.deleteUser(uuidv4(), token).expect(404);
  });

  it('/users/:id (DELETE) 403 - fail (user is trying delete another user)', async () => {
    user = await testApi.createUser(createUserDto);
    secondUser = await testApi.createUser(secondUserDto);

    const loggedUser = await testApi.login(loginUserDto);

    const token = loggedUser.body.token;
    const secondUserId = secondUser.body.user.id;

    await testApi.deleteUser(secondUserId, token).expect(403);
  });

  it('/users/:id (DELETE) 204 - success (user is deleted)', async () => {
    user = await testApi.createUser(createUserDto);
    const loggedUser = await testApi.login(loginUserDto);

    const token = loggedUser.body.token;
    const userId = loggedUser.body.user.id;

    await testApi.deleteUser(userId, token).expect(204);
    await testApi.getUserById(userId).expect(404);
  });
});
