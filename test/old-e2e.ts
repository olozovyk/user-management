// import { Test, TestingModule } from '@nestjs/testing';
// import { Response } from 'supertest';
// import { App } from 'supertest/types';
// import { v4 as uuidv4 } from 'uuid';
// import { INestApplication, ValidationPipe } from '@nestjs/common';
//
// import { AppModule } from '@modules/app.module';
// import { UserService } from '@modules/user/services';
// import { TestApi } from './api';
// import { delay } from './utils';
// import { SupertestResponseWithBody } from './types';
//
// describe('Users (e2e)', () => {
//   let app: INestApplication<App>;
//   let usersService: UserService;
//   const testApi = TestApi.getInstance();
//
//   let firstUserResponse: SupertestResponseWithBody<{
//     user: { id: string };
//   }> | null;
//   let secondUserResponse: SupertestResponseWithBody<{
//     user: { id: string };
//   }> | null;
//
//   const uuidSplit = () => uuidv4().slice(0, 10);
//
//   const createUserDtoWithoutPassword = {
//     email: `${uuidSplit()}@some.com`,
//     nickname: `Test_${uuidSplit()}`,
//     firstName: 'Test',
//     lastName: 'Test',
//   };
//
//   const createUserDto = {
//     ...createUserDtoWithoutPassword,
//     password: uuidSplit(),
//   };
//
//   const secondUserDto = {
//     ...createUserDto,
//     email: createUserDto.email + '.second',
//     nickname: createUserDto.nickname + '_',
//   };
//
//   const loginUserDto = {
//     nickname: createUserDto.nickname,
//     password: createUserDto.password,
//   };
//
//   beforeEach(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();
//
//     app = moduleFixture.createNestApplication();
//     usersService = moduleFixture.get<UserService>(UserService);
//     app.useGlobalPipes(new ValidationPipe());
//     await app.init();
//
//     testApi.app = app;
//   });
//
//   afterEach(async () => {
//     const userId = firstUserResponse?.body.user.id;
//
//     if (userId) {
//       await usersService.deleteUser(userId);
//       firstUserResponse = null;
//     }
//
//     const secondUserId = secondUserResponse?.body.user.id;
//
//     if (secondUserId) {
//       await usersService.deleteUser(secondUserId);
//       secondUserResponse = null;
//     }
//
//     await app.close();
//   });
//
//   // Done:
//   it("/users/ (GET) 200 - success (should return user's array)", async () => {
//     const users = await testApi.getUsers();
//     expect(users.status).toBe(200);
//     expect(Array.isArray(users.body.users)).toBeTruthy();
//   });
//
//   it('/users/:id (GET) 401 - faild (should throw an error - unauthorized)', async () => {
//     const userId = uuidv4();
//     await testApi.getUserById(userId).expect(401);
//   });
//
//   // In progress:
//   it('/auth/signup/ (POST) 400 - fail (should throw an error - a nickname in use)', async () => {
//     firstUserResponse = await testApi.createUser(createUserDto);
//     const res = (await testApi.createUser(
//       createUserDto,
//     )) as unknown as SupertestResponseWithBody<{
//       message: string;
//     }>;
//     expect(res.status).toBe(400);
//     expect(res.body.message).toBe('Such a nickname already in use.');
//   });

// it('/auth/signup/ (POST) 400 - fail (should throw an error - password is absent)', async () => {
//   const res = await testApi
//     .createUser(createUserDtoWithoutPassword)
//     .expect(400);
//   expect(res.body.message).toEqual([
//     'password must be longer than or equal to 5 characters',
//     'password must be a string',
//     'password should not be empty',
//   ]);
// });

// Done:
// it('/auth/signup/ (POST) 201 - success (should return 201)', () => {
// testApi.createUser(createUserDto).expect(201);
// });

// it('/auth/login/ (POST) 400 - fail (should return an error - password is not correct)', async () => {
//   user = await testApi.createUser(createUserDto);

//   const res = await testApi
//     .login({
//       ...loginUserDto,
//       password: loginUserDto.password + '_',
//     })
//     .expect(400);
//   expect(res.body.message).toBe('Login or password is not correct');
// });

// it('/auth/login/ (POST) 200 - success (should return a token)', async () => {
//   user = await testApi.createUser(createUserDto);
//   const loggedUser = await testApi.login(loginUserDto).expect(200);
//   expect(loggedUser.body.token).toBeTruthy();
// });

// it(`/users/:id/ (PATCH) 403 - fail (should throw an error - user attempts to change another user)`, async () => {
//   user = await testApi.createUser(createUserDto);
//   secondUser = await testApi.createUser(secondUserDto);

//   const loggedUser = await testApi.login(loginUserDto);
//   const token = loggedUser.body.token;

//   const lastModified = secondUser.headers['last-modified'];
//   const userId = secondUser.body.user.id;

//   testApi
//     .editUser({
//       userId,
//       editUserDto: { firstName: createUserDto.firstName + '_' },
//       lastModified,
//       token: token,
//     })
//     .expect(403);
// });

// it('/users/:id/ (PATCH) 404 - fail (should throw an error - user is not found)', async () => {
//   user = await testApi.createUser(createUserDto);
//   const loggedUser = await testApi.login(loginUserDto);

//   const token = loggedUser.body.token;
//   const lastModified = user.headers['last-modified'];

//   testApi
//     .editUser({
//       userId: uuidv4(),
//       editUserDto: { firstName: createUserDto.firstName + '_' },
//       lastModified,
//       token: token,
//     })
//     .expect(404);
// });

// it(`/users/:id/ (PATCH) 403 - fail (should throw an error - user is trying to change role)`, async () => {
//   user = await testApi.createUser(createUserDto);
//   const loggedUser = await testApi.login(loginUserDto);

//   const token = loggedUser.body.token;
//   const lastModified = user.headers['last-modified'];

//   testApi
//     .editUser({
//       userId: loggedUser.body.user.id,
//       editUserDto: { role: 'moderator' },
//       lastModified,
//       token: token,
//     })
//     .expect(403);
// });

// it('/users/:id/ (PATCH) 200 - success (should change a firstName - firstName is changed)', async () => {
//   user = await testApi.createUser(createUserDto);
//   const loggedUser = await testApi.login(loginUserDto);

//   const token = loggedUser.body.token;
//   const lastModified = user.headers['last-modified'];
//   const userId = loggedUser.body.user.id;

//   await testApi.editUser({
//     userId,
//     editUserDto: { firstName: createUserDto.firstName + '_' },
//     lastModified,
//     token,
//   });

//   const changedFirstName = (await testApi.getUserById(userId, token)).body
//     .user.firstName;

//   expect(changedFirstName).not.toBe(createUserDto.nickname);
// });

// it('/users/:id/ (PATCH) 400 - fail (should throw an error - the user information is not up to date)', async () => {
//   user = await testApi.createUser(createUserDto);
//   const loggedUser = await testApi.login(loginUserDto);

//   const token = loggedUser.body.token;
//   const lastModified = user.headers['last-modified'];
//   const userId = loggedUser.body.user.id;

//   await delay(1_000);

//   await testApi.editUser({
//     userId,
//     editUserDto: { firstName: createUserDto.firstName + '_' },
//     lastModified,
//     token,
//   });

//   const res = await testApi
//     .editUser({
//       userId,
//       editUserDto: { firstName: createUserDto.firstName + '__' },
//       lastModified,
//       token,
//     })
//     .expect(400);
//   expect(res.body.message).toBe(
//     'The user information is not up to date. Set correct "If-unmodified-since" header',
//   );
// });

// it('/users/:id (DELETE) 404 - fail (should throw an error - user is not found)', async () => {
//   user = await testApi.createUser(createUserDto);
//   const loggedUser = await testApi.login(loginUserDto);
//   const token = loggedUser.body.token;

//   testApi.deleteUser(uuidv4(), token).expect(404);
// });

// it('/users/:id (DELETE) 403 - fail (should throw an error - user is trying delete another user)', async () => {
//   user = await testApi.createUser(createUserDto);
//   secondUser = await testApi.createUser(secondUserDto);

//   const loggedUser = await testApi.login(loginUserDto);

//   const token = loggedUser.body.token;
//   const secondUserId = secondUser.body.user.id;

//   testApi.deleteUser(secondUserId, token).expect(403);
// });

// it('/users/:id (DELETE) 204 - success (should delete a user)', async () => {
//   user = await testApi.createUser(createUserDto);
//   const loggedUser = await testApi.login(loginUserDto);

//   const token = loggedUser.body.token;
//   const userId = loggedUser.body.user.id;

//   await testApi.deleteUser(userId, token).expect(204);
//   testApi.getUserById(userId, token).expect(404);
// });

// TODO: refactor next tests after checking/refactoring voting logic:

// it('/users/:id/rating (POST) 200 - success (should change rating)', async () => {
//   user = await testApi.createUser(createUserDto);
//
//   secondUser = await testApi.createUser(secondUserDto);
//
//   const loggedUser = await testApi.login(loginUserDto);
//   const token = loggedUser.body.token;
//
//   const targetUserId = secondUser.body.user.id;
//   const voteValue = 1;
//   const lastModified = secondUser.headers['last-modified'];
//
//   await testApi
//     .vote({ targetUserId, voteValue, lastModified, token })
//     .expect(200);
//
//   const updatedRating = (await testApi.getUserById(targetUserId)).body.user
//     .rating;
//   expect(updatedRating).toBe(1);
// });

// it('/users/:id/rating (POST) 400 - fail (should throw an error - an unacceptable value)', async () => {
//   user = await testApi.createUser(createUserDto);
//   secondUser = await testApi.createUser(secondUserDto);
//
//   const loggedUser = await testApi.login(loginUserDto);
//   const token = loggedUser.body.token;
//
//   const targetUserId = secondUser.body.user.id;
//   const voteValue = 2;
//   const lastModified = secondUser.headers['last-modified'];
//
//   const res = await testApi
//     .vote({ targetUserId, voteValue, lastModified, token })
//     .expect(400);
//   expect(res.body.message).toEqual(['Accepted value are 1, 0, -1']);
// });
//
// it('/users/:id/rating (POST) 400 - fail (should throw an error - user has already voted)', async () => {
//   user = await testApi.createUser(createUserDto);
//   secondUser = await testApi.createUser(secondUserDto);
//
//   const loggedUser = await testApi.login(loginUserDto);
//   const token = loggedUser.body.token;
//
//   const targetUserId = secondUser.body.user.id;
//   const voteValue = 1;
//   let lastModified = secondUser.headers['last-modified'];
//
//   await testApi.vote({ targetUserId, voteValue, lastModified, token });
//
//   const updatedTargetUser = await testApi.getUserById(targetUserId);
//   lastModified = updatedTargetUser.headers['last-modified'];
//
//   const res = await testApi
//     .vote({
//       targetUserId,
//       voteValue,
//       lastModified,
//       token,
//     })
//     .expect(400);
//   expect(res.body.message).toBe('You have already voted for this user');
// });
// });
