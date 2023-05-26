import { Injectable, Logger } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'node:crypto';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createTokens(id: number, nickname: string) {
    const accessSecret = this.configService.get('JWT_ACCESS_SECRET');
    const accessTtl = this.configService.get('JWT_ACCESS_TTL');
    const refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
    const refreshTtl = this.configService.get('JWT_REFRESH_TTL');

    const accessToken = await this.jwtService.signAsync(
      { id, nickname },
      { secret: accessSecret, expiresIn: accessTtl },
    );

    const refreshToken = await this.jwtService.signAsync(
      { id, nickname },
      { secret: refreshSecret, expiresIn: refreshTtl },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  saveToken(token: string, userId: number) {
    return this.authRepository.saveToken(token, userId);
  }

  async decodeToken(token: string) {
    const secret = this.configService.get('JWT_REFRESH_SECRET');

    try {
      await this.jwtService.verifyAsync(token, { secret });
      return this.jwtService.decode(token);
    } catch (e) {
      this.logger.error('Token is not valid');
    }
  }

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

  deleteToken(token: string) {
    return this.authRepository.deleteToken(token);
  }
}
