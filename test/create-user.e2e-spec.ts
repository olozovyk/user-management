import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '@modules/app.module';
import { UserService } from '@modules/user/services';
import { IUser } from '@modules/user/types';

describe('create user - e2e', () => {
  let app: INestApplication<App>;
  let userService: UserService;

  const createUserDto = {
    email: 'test_user@example.com',
    nickname: 'Test',
    firstName: 'Test',
    lastName: 'Test',
    password: 'test_password',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    userService = moduleRef.get<UserService>(UserService);
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  beforeEach(async () => {
    const user = await userService.getUserByEmail(createUserDto.email);
    if (user) {
      await userService.deleteUser(user.id);
    }
  });

  afterEach(async () => {
    const user = await userService.getUserByEmail(createUserDto.email);
    if (user) {
      await userService.deleteUser(user.id);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/signup (POST) 201 - success (user created)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(createUserDto);
    expect(res.status).toBe(201);
    const { user } = res.body as { user: IUser };
    expect(user.email).toBe(createUserDto.email);
  });

  // TODO - add cases: not unique email, lack of fields, validation problems
});
