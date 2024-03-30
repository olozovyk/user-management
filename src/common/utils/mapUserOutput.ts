import { User } from '@modules/user/entities';
import { IUser } from '../types';

export const mapUserOutput = (user: User): IUser => {
  const {
    id,
    email,
    verifiedEmail,
    nickname,
    firstName,
    lastName,
    role,
    rating,
    avatar,
  } = user;
  return {
    id,
    email,
    verifiedEmail,
    nickname,
    firstName,
    lastName,
    role,
    rating,
    avatarUrl: avatar ? avatar.avatarUrl : null,
  };
};
