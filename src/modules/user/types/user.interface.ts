import { RoleType } from './roles';

export interface IPublicUser {
  nickname: string;
  firstName: string;
  lastName: string;
  rating: number;
  avatarUrl: string | null;
}

export interface IUser extends IPublicUser {
  id: string;
  email: string;
  verifiedEmail: boolean;
  role: RoleType;
}
