import { PickType } from '@nestjs/swagger';
import { UserResDto } from './userRes.dto';

export class AvatarResDto extends PickType(UserResDto, [
  'avatarUrl',
] as const) {}
