import { randomUUID } from 'node:crypto';
import { CreateUserDto } from '@modules/auth/dto';

const uuid = randomUUID();

export const createUserTestDto = {
  email: uuid.slice(0, 4) + '@' + uuid.slice(0, 4) + '.com',
  nickname: uuid.slice(0, 4),
  firstName: uuid.slice(0, 4),
  lastName: uuid.slice(0, 4),
  password: uuid.slice(0, 6),
} satisfies CreateUserDto;
