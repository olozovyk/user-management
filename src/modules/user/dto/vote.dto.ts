import { IsIn, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { VoteType, VoteValues } from '../types';

export class VoteDto {
  /*
   * @example 1
   * */
  @IsNotEmpty()
  @Type(() => Number)
  @IsIn(VoteValues, { message: 'Accepted value are 1, 0, -1' })
  vote: VoteType;
}
