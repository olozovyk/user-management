import { Type } from 'class-transformer';
import { IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryPaginationDto {
  @ApiProperty({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit: number;

  @ApiProperty({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number;
}
