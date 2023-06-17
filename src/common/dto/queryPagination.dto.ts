import { Type } from 'class-transformer';
import { IsOptional, Min } from 'class-validator';

export class QueryPaginationDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number;
}
