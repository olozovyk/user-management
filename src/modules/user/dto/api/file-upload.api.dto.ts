import { ApiProperty } from '@nestjs/swagger';

export class FileUploadApiDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  avatar: any;
}
