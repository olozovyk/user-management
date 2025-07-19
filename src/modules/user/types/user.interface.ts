import { RoleType } from './roles';

export interface IPublicUser {
  id: string;
  nickname: string;
  firstName: string;
  lastName: string;
  rating: number;
  avatarUrl: string | null;
}

export interface IUser extends IPublicUser {
  email: string;
  verifiedEmail: boolean;
  role: RoleType;
}
