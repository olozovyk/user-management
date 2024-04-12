import { RoleType } from '@modules/user/types';

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenPayload {
  id: string;
  email: string;
  nickname: string;
  role: RoleType;
}
