import { IsEnum } from 'class-validator';
import { Role, RoleType } from '../types';
import { CreateUserDto } from './createUser.dto';

export class EditUserDto extends CreateUserDto {
  @IsEnum(Role)
  role: RoleType;
}
