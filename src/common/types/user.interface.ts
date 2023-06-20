import { RoleType } from './roles';

export interface IUser {
  id: string;
  nickname: string;
  firstName: string;
  lastName: string;
  role: RoleType;
  rating: number;
  avatarUrl: string | null;
}
