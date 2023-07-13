import * as crypto from 'node:crypto';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';

dotenv.config();

export const createHash = (password: string): string => {
  const configService = new ConfigService();

  const algorithm = configService.getOrThrow<string>('HASH_ALGORITHM');
  const localSalt = configService.getOrThrow<string>('LOCAL_SALT');
  const iterations = Number(configService.getOrThrow('ITERATIONS'));
  const keylen = Number(configService.getOrThrow('KEYLEN'));

  const remoteSalt = crypto
    .createHash(algorithm)
    .update(password)
    .digest('hex');

  const salt = localSalt + remoteSalt;

  const hashToPassword = crypto
    .pbkdf2Sync(password, salt, iterations, keylen, algorithm)
    .toString('hex');
  return hashToPassword + remoteSalt;
};
