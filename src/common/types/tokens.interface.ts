import { RoleType } from './roles';

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenPayload {
  id: string;
  nickname: string;
  role: RoleType;
}
