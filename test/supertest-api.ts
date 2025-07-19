import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { CreateUserDto } from '@modules/auth/dto';

export const createUserRequest = (
  app: INestApplication<App>,
  createUserDto: CreateUserDto,
): request.Test => {
  return request(app.getHttpServer()).post('/auth/signup').send(createUserDto);
};
