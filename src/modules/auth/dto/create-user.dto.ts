import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateUserDto {
  /*
   * @example john
   * */
  @IsNotEmpty()
  @IsString()
  @Length(4, 20)
  nickname: string;

  /*
   * @example John
   * */
  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  firstName: string;

  /*
   * @example Walsh
   * */
  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  lastName: string;

  /*
   * @example *****
   * */
  @IsNotEmpty()
  @IsString()
  @Length(5, 20)
  password: string;
}
