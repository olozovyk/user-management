import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { INestApplication, ValidationPipe } from '@nestjs/common';

import { AppModule } from '../src/modules/app.module';
import { User } from '../src/common/entities';
import { UsersService } from '../src/modules/users/users.service';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;

  const uuidSplit = uuidv4().slice(0, 15);

  const createUserDtoWithoutPassword = {
    nickname: `test_${uuidSplit}`,
    firstName: 'John',
    lastName: 'Walsh',
  };

  const createUserDto = {
    ...createUserDtoWithoutPassword,
    password: '12345',
  };

  const loginUserDto = {
    nickname: createUserDto.nickname,
    password: createUserDto.password,
  };

  let user: Partial<User>;
  let secondUser: Partial<User>;
  let token: string;
  let lastModified: string;
  let isCreatedCaseDone = false;
  let isLoginCaseDone = false;

  const createAndLoginSecondUser = async () => {
    const newUser = await request(app.getHttpServer())
      .post('/auth/signup/')
      .send({
        ...createUserDto,
        nickname: createUserDto.nickname.replace('test_', 'test1'),
      });

    secondUser = newUser.body.user;

    const loggedUser = await request(app.getHttpServer())
      .post('/auth/login/')
      .send({
        nickname: newUser.body.user.nickname,
        password: createUserDto.password,
      });

    return loggedUser.body.token;
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    usersService = moduleFixture.get<UsersService>(UsersService);
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    if (!isCreatedCaseDone) {
      return;
    }

    user = (
      await request(app.getHttpServer())
        .post('/auth/signup/')
        .send(createUserDto)
    ).body.user;

    if (!isLoginCaseDone) {
      return;
    }

    const loggedUser = await request(app.getHttpServer())
      .post('/auth/login/')
      .send(loginUserDto);

    token = loggedUser.body.token;
    lastModified = loggedUser.headers['last-modified'];
  });

  afterEach(async () => {
    if (user && user.id) {
      await usersService.deleteUser(user.id);
      user = {};
    }

    if (secondUser && secondUser.id) {
      await usersService.deleteUser(secondUser.id);
      secondUser = {};
    }

    await app.close();
  });

  it('/auth/signup/ (POST) 400 - fail (not unique nickname)', async () => {
    user = (
      await request(app.getHttpServer())
        .post('/auth/signup/')
        .send(createUserDto)
    ).body.user;

    await request(app.getHttpServer())
      .post('/auth/signup/')
      .send(createUserDto)
      .expect(400);
  });

  it('/auth/signup/ (POST) 400 - fail (password is absent)', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup/')
      .send(createUserDtoWithoutPassword)
      .expect(400);
  });

  it('/auth/signup/ (POST) 201 - success', async () => {
    const newUser = await request(app.getHttpServer())
      .post('/auth/signup/')
      .send(createUserDto)
      .expect(201);
    user = newUser.body.user;
    isCreatedCaseDone = true;
  });

  it('/auth/login/ (POST) 400 - fail (password is not correct)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login/')
      .send({ ...loginUserDto, password: loginUserDto.password + '_' })
      .expect(400);
  });

  it('/auth/login/ (POST) 200 - success', async () => {
    const result = await request(app.getHttpServer())
      .post('/auth/login/')
      .send(loginUserDto)
      .expect(200);
    expect(result.body.token).toBeTruthy();
    isLoginCaseDone = true;
  });

  it(`/users/:id/ (PATCH) 403 - fail (user's attempt to change another user)`, async () => {
    const tokenForSecondUser = await createAndLoginSecondUser();

    await request(app.getHttpServer())
      .patch(`/users/${user.id}`)
      .send({ firstName: createUserDto.firstName + '_' })
      .set('If-unmodified-since', lastModified)
      .set('Authorization', `Bearer ${tokenForSecondUser}`)
      .expect(403);
  });

  it('/users/:id/ (PATCH) 404 - fail (user is not found)', async () => {
    await request(app.getHttpServer())
      .patch(`/users/${uuidv4()}`)
      .send({ firstName: createUserDto.firstName + '_' })
      .set('If-unmodified-since', lastModified)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it(`/users/:id/ (PATCH) 403 - fail (user is trying to change role)`, async () => {
    await request(app.getHttpServer())
      .patch(`/users/${user.id}`)
      .send({ role: 'moderator' })
      .set('If-unmodified-since', lastModified)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('/users/:id/ (PATCH) 200 - success (first name is changed)', async () => {
    await request(app.getHttpServer())
      .patch(`/users/${user.id}`)
      .send({ firstName: createUserDto.firstName + '_' })
      .set('If-unmodified-since', lastModified)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('/users/:id (DELETE) 404 - fail (user is not found)', async () => {
    await request(app.getHttpServer())
      .delete(`/users/${uuidv4()}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('/users/:id (DELETE) 403 - fail (user is trying delete another user)', async () => {
    const tokenForSecondUser = await createAndLoginSecondUser();

    await request(app.getHttpServer())
      .delete(`/users/${user.id}`)
      .set('Authorization', `Bearer ${tokenForSecondUser}`)
      .expect(403);
  });

  it('/users/:id (DELETE) 204', async () => {
    await request(app.getHttpServer())
      .delete(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });
});
