import { IsString, IsNotEmpty, Length } from 'class-validator';

export class LoginDto {
  /*
   * @example john
   * */
  @IsNotEmpty()
  @IsString()
  @Length(4, 20)
  nickname: string;

  /*
   * @example ******
   * */
  @IsNotEmpty()
  @IsString()
  @Length(5, 20)
  password: string;
}
