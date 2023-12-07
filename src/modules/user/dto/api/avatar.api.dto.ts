import { PickType } from '@nestjs/swagger';
import { UserApiDto } from '@modules/user/dto/api';

export class AvatarApiDto extends PickType(UserApiDto, [
  'avatarUrl',
] as const) {}
