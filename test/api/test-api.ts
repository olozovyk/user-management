import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { CreateUserDto, LoginDto } from '@modules/auth/dto';
import { RoleType } from '@modules/user/types';

interface IEditUserParams {
  userId: string;
  editUserDto: Partial<CreateUserDto & { role: RoleType }>;
  lastModified: string;
  token: string;
}

interface IVoteParams {
  targetUserId: string;
  voteValue: unknown; // unknown is to check for unacceptable values
  lastModified: string;
  token: string;
}

export class TestApi {
  private static instance: TestApi;
  private _app: INestApplication;

  public static getInstance() {
    if (!TestApi.instance) {
      TestApi.instance = new TestApi();
    }
    return TestApi.instance;
  }

  public set app(app: INestApplication) {
    this._app = app;
  }

  public getUsers(): request.Test {
    return request(this._app.getHttpServer()).get('/users/');
  }

  public getUserById(userId: string): request.Test {
    return request(this._app.getHttpServer()).get(`/users/${userId}`);
  }

  public createUser(createUserDto: Partial<CreateUserDto>): request.Test {
    return request(this._app.getHttpServer())
      .post('/auth/signup/')
      .send(createUserDto);
  }

  public login(loginDto: LoginDto): request.Test {
    return request(this._app.getHttpServer())
      .post('/auth/login/')
      .send(loginDto);
  }

  public editUser({
    userId,
    editUserDto,
    lastModified,
    token,
  }: IEditUserParams): request.Test {
    return request(this._app.getHttpServer())
      .patch(`/users/${userId}`)
      .send(editUserDto)
      .set('If-unmodified-since', lastModified)
      .set('Authorization', `Bearer ${token}`);
  }

  public deleteUser(userId: string, token: string): request.Test {
    return request(this._app.getHttpServer())
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`);
  }

  public vote({
    targetUserId,
    voteValue,
    lastModified,
    token,
  }: IVoteParams): request.Test {
    return request(this._app.getHttpServer())
      .post(`/users/${targetUserId}/rating`)
      .send({ vote: voteValue })
      .set('If-unmodified-since', lastModified)
      .set('Authorization', `Bearer ${token}`);
  }
}
