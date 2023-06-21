import { ApiProperty } from '@nestjs/swagger';
import { Role, RoleType } from '../../types';

export class UserResDto {
  @ApiProperty({ example: '215325ea-f09a-40ea-9e73-d2f8b1dc675f' })
  id: string;

  @ApiProperty({ example: 'john' })
  nickname: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Walsh' })
  lastName: string;

  // TODO add enum correctly
  @ApiProperty({ example: 'user', enum: Role })
  role: RoleType;

  @ApiProperty({ example: '17' })
  rating: number;

  @ApiProperty({
    example:
      'https://user-management-avatars.s3.eu-central-1.amazonaws.com/215325ea-f09a-40ea-9e73-d2f8b1dc675f.jpg',
  })
  avatarUrl: string | null;
}
