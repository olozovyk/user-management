import { User } from '@modules/user/entities';
import { IPublicUser, IUser } from '@modules/user/types';

function mapUserOutput(user: User, isProtected: true): IUser;
function mapUserOutput(user: User, isProtected?: false): IPublicUser;
function mapUserOutput(user: User, isProtected?: boolean): IPublicUser | IUser {
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

  const userToReturn = {
    nickname,
    firstName,
    lastName,
    rating,
    avatarUrl: avatar ? avatar.avatarUrl : null,
  };

  if (isProtected) {
    return {
      ...userToReturn,
      id,
      email,
      verifiedEmail,
      role,
    };
  }

  return userToReturn;
}

export { mapUserOutput };
