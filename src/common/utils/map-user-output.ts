import { UserEntity } from '@modules/user/entities';
import { IPublicUser, IUser } from '@modules/user/types';

function mapUserOutput(user: UserEntity, isProtected: true): IUser;
function mapUserOutput(user: UserEntity, isProtected?: false): IPublicUser;
function mapUserOutput(
  user: UserEntity,
  isProtected?: boolean,
): IPublicUser | IUser {
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
    id,
    nickname,
    firstName,
    lastName,
    rating,
    avatarUrl: avatar ? avatar.avatarUrl : null,
  };

  if (isProtected) {
    return {
      ...userToReturn,
      email,
      verifiedEmail,
      role,
    };
  }

  return userToReturn;
}

export { mapUserOutput };
