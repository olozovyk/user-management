import { Request } from 'express';
import { UserEntity } from '../entities';

export type RequestWithUserEntity = Request & { user: UserEntity };
