import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HashPasswordService {
  constructor(private configService: ConfigService) {}

  createHash(password: string) {
    const algorithm = this.configService.get('HASH_ALGORITHM');
    const localSalt = this.configService.get('LOCAL_SALT');
    const iterations = Number(this.configService.get('ITERATIONS'));
    const keylen = Number(this.configService.get('KEYLEN'));

    const remoteSalt = crypto
      .createHash(algorithm)
      .update(password)
      .digest('hex');

    const salt = localSalt + remoteSalt;

    const hashToPassword = crypto
      .pbkdf2Sync(password, salt, iterations, keylen, algorithm)
      .toString('hex');
    return hashToPassword + remoteSalt;
  }
}
