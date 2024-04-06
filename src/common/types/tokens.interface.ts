import { RoleType } from './roles';

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
