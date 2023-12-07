import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Role, RoleType } from '@common/types';
import { ApiProperty } from '@nestjs/swagger';

export class EditUserDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 20)
  firstName: string;

  @ApiProperty({ example: 'Walsh', required: false })
  @IsOptional()
  @IsString()
  @Length(2, 20)
  lastName: string;

  @ApiProperty({ example: '*****', required: false })
  @IsOptional()
  @IsString()
  @Length(5, 20)
  password: string;

  @ApiProperty({ enum: Role, example: 'user', required: false })
  @IsOptional()
  @IsEnum(Role)
  role: RoleType;
}
