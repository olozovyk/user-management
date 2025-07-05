import { Response } from 'supertest';

export type SupertestResponseWithBody<T> = Omit<Response, 'body'> & { body: T };
