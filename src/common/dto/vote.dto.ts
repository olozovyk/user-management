import { IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { VoteValues } from '../types';
import { ApiProperty } from '@nestjs/swagger';

export class VoteDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsEnum(VoteValues, { message: 'Accepted value are 1, 0, -1' })
  @ApiProperty({ enum: VoteValues })
  vote: number;
}
