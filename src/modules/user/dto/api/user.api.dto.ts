import { RoleType } from '@modules/user/types';

export class PublicUserApiDto {
  /*
   * @example john
   * */
  nickname: string;

  /*
   * @example John
   * */
  firstName: string;

  /*
   * @example Walsh
   * */
  lastName: string;

  /*
   * @example 17
   * */
  rating: number;

  /*
   * @example https://user-management-avatars.s3.eu-central-1.amazonaws.com/215325ea-f09a-40ea-9e73-d2f8b1dc675f.jpg
   * */
  avatarUrl: string | null;
}

export class UserApiDto extends PublicUserApiDto {
  /*
   * @example 215325ea-f09a-40ea-9e73-d2f8b1dc675f
   * */
  id: string;

  /*
   * @example john@mail.com
   * */
  email: string;

  /*
   * @example user
   * */
  role: RoleType;
}
