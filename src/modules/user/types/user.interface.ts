import { RoleType } from './roles';

export interface IUser {
  id: string;
  email: string;
  verifiedEmail: boolean;
  nickname: string;
  firstName: string;
  lastName: string;
  role: RoleType;
  rating: number;
  avatarUrl: string | null;
}
