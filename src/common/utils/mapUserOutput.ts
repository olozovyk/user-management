import { User } from '../entities';
import { IUser } from '../types';

export const mapUserOutput = (user: User): IUser => {
  const { id, nickname, firstName, lastName, role } = user;
  return {
    id,
    nickname,
    firstName,
    lastName,
    role,
  };
};
