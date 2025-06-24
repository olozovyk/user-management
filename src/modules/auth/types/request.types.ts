import { Request } from 'express';
import { ITokenPayload } from './tokens.interface';

export type RequestWithTokenPayload = Request & { user: ITokenPayload };
