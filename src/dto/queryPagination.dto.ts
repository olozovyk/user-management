import { Transform, Type } from 'class-transformer';
import { IsOptional, Min } from 'class-validator';

export class QueryPaginationDto {
  @IsOptional()
  @Type(() => String)
  @Transform(({ value }) => Number(value))
  @Min(1)
  limit: number;

  @IsOptional()
  @Type(() => String)
  @Transform(({ value }) => Number(value))
  @Min(1)
  page: number;
}
