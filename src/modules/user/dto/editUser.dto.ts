import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Role, RoleType } from '@common/types';
import { ApiProperty } from '@nestjs/swagger';

export class EditUserDto {
  @ApiProperty({ example: 'John' })
  @IsOptional()
  @IsString()
  @Length(2, 20)
  firstName: string;

  @ApiProperty({ example: 'Walsh' })
  @IsOptional()
  @IsString()
  @Length(2, 20)
  lastName: string;

  @ApiProperty({ example: '123456' })
  @IsOptional()
  @IsString()
  @Length(5, 20)
  password: string;

  @ApiProperty({ enum: Role, example: 'user' })
  @IsOptional()
  @IsEnum(Role)
  role: RoleType;
}
