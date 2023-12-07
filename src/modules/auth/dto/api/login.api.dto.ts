import { GetUserApiDto } from '@modules/user/dto/api';

export class LoginApiDto extends GetUserApiDto {
  /*
   * @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   * */
  token: string;
}
