import { IsString, IsNotEmpty, Length } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @Length(4, 20)
  nickname: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 20)
  password: string;
}
