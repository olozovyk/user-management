import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '@modules/app.module';
import { UserService } from '@modules/user/user.service';
import { TestApi } from './api';
import { delay } from './utils';

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
    const res = await testApi.createUser(createUserDto).expect(400);
    expect(res.body.message).toBe('Such a nickname already in use.');
  });

  it('/auth/signup/ (POST) 400 - fail (password is absent)', async () => {
    const res = await testApi
      .createUser(createUserDtoWithoutPassword)
      .expect(400);
    expect(res.body.message).toEqual([
      'password must be longer than or equal to 5 characters',
      'password must be a string',
      'password should not be empty',
    ]);
  });

  it('/auth/signup/ (POST) 201 - success', () => {
    testApi.createUser(createUserDto).expect(201);
  });

  it('/auth/login/ (POST) 400 - fail (password is not correct)', async () => {
    user = await testApi.createUser(createUserDto);

    const res = await testApi
      .login({
        ...loginUserDto,
        password: loginUserDto.password + '_',
      })
      .expect(400);
    expect(res.body.message).toBe('Login or password is not correct');
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

    testApi
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

    testApi
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

    testApi
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

  it('/users/:id/ (PATCH) 400 - fail (The user information is not up to date)', async () => {
    user = await testApi.createUser(createUserDto);
    const loggedUser = await testApi.login(loginUserDto);

    const token = loggedUser.body.token;
    const lastModified = user.headers['last-modified'];
    const userId = loggedUser.body.user.id;

    await delay(1_000);

    await testApi.editUser({
      userId,
      editUserDto: { firstName: createUserDto.firstName + '_' },
      lastModified,
      token,
    });

    const res = await testApi
      .editUser({
        userId,
        editUserDto: { firstName: createUserDto.firstName + '__' },
        lastModified,
        token,
      })
      .expect(400);
    expect(res.body.message).toBe(
      'The user information is not up to date. Set correct last-modified header',
    );
  });

  it('/users/:id (DELETE) 404 - fail (user is not found)', async () => {
    user = await testApi.createUser(createUserDto);
    const loggedUser = await testApi.login(loginUserDto);
    const token = loggedUser.body.token;

    testApi.deleteUser(uuidv4(), token).expect(404);
  });

  it('/users/:id (DELETE) 403 - fail (user is trying delete another user)', async () => {
    user = await testApi.createUser(createUserDto);
    secondUser = await testApi.createUser(secondUserDto);

    const loggedUser = await testApi.login(loginUserDto);

    const token = loggedUser.body.token;
    const secondUserId = secondUser.body.user.id;

    testApi.deleteUser(secondUserId, token).expect(403);
  });

  it('/users/:id (DELETE) 204 - success (user is deleted)', async () => {
    user = await testApi.createUser(createUserDto);
    const loggedUser = await testApi.login(loginUserDto);

    const token = loggedUser.body.token;
    const userId = loggedUser.body.user.id;

    await testApi.deleteUser(userId, token).expect(204);
    testApi.getUserById(userId).expect(404);
  });

  it('/users/:id/rating (POST) 200 - success (a vote is received)', async () => {
    user = await testApi.createUser(createUserDto);
    secondUser = await testApi.createUser(secondUserDto);

    const loggedUser = await testApi.login(loginUserDto);
    const token = loggedUser.body.token;

    const targetUserId = secondUser.body.user.id;
    const voteValue = 1;
    const lastModified = secondUser.headers['last-modified'];

    await testApi
      .vote({ targetUserId, voteValue, lastModified, token })
      .expect(200);

    const updatedRating = (await testApi.getUserById(targetUserId)).body.user
      .rating;
    expect(updatedRating).toBe(1);
  });

  it('/users/:id/rating (POST) 400 - fail (Unacceptable value)', async () => {
    user = await testApi.createUser(createUserDto);
    secondUser = await testApi.createUser(secondUserDto);

    const loggedUser = await testApi.login(loginUserDto);
    const token = loggedUser.body.token;

    const targetUserId = secondUser.body.user.id;
    const voteValue = 2;
    const lastModified = secondUser.headers['last-modified'];

    const res = await testApi
      .vote({ targetUserId, voteValue, lastModified, token })
      .expect(400);
    expect(res.body.message).toEqual(['Accepted value are 1, 0, -1']);
  });

  it('/users/:id/rating (POST) 400 - fail (This user has already voted)', async () => {
    user = await testApi.createUser(createUserDto);
    secondUser = await testApi.createUser(secondUserDto);

    const loggedUser = await testApi.login(loginUserDto);
    const token = loggedUser.body.token;

    const targetUserId = secondUser.body.user.id;
    const voteValue = 1;
    let lastModified = secondUser.headers['last-modified'];

    await testApi.vote({ targetUserId, voteValue, lastModified, token });

    const updatedTargetUser = await testApi.getUserById(targetUserId);
    lastModified = updatedTargetUser.headers['last-modified'];

    const res = await testApi
      .vote({
        targetUserId,
        voteValue,
        lastModified,
        token,
      })
      .expect(400);
    expect(res.body.message).toBe('You have already voted for this user');
  });
});
