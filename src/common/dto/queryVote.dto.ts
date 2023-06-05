import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryVoteDto {
  @IsNotEmpty()
  user: string;

  @IsNotEmpty()
  @Type(() => String)
  @Transform(({ value }) => Number(value))
  @IsEnum([1, 0, -1], { message: 'Accepted value are 1, 0, -1' })
  value: number;
}
