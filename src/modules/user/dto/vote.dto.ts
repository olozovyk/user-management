import { IsIn, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { VoteType, VoteValues } from '../types';
import { ApiProperty } from '@nestjs/swagger';

export class VoteDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsIn(VoteValues, { message: 'Accepted value are 1, 0, -1' })
  @ApiProperty({ enum: VoteValues })
  vote: VoteType;
}
