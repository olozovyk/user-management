import { UserResDto } from './userRes.dto';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResDto {
  @ApiProperty()
  user: UserResDto;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIxNTMyNWVhLWYwOWEtNDBlYS05ZTczLWQyZjhiMWRjNjc1ZiIsIm5pY2tuYW1lIjoianVsaWEiLCJyb2xlIjoidXNlciIsImlhdCI6MTY4NzM3NzA4NywiZXhwIjoxNjg3Mzc3OTg3fQ.QLpEArFOAzQrohNoXZDxz1cSGLJNPbqP8aFYkLxOTQg',
  })
  token: string;
}
