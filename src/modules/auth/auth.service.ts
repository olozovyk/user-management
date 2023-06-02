import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'node:crypto';

import { AuthRepository } from './auth.repository';
import { ITokenPayload, ITokens } from 'src/common/types';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  public async createTokens(id: string, nickname: string): Promise<ITokens> {
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

  public saveToken(token: string, userId: string): void {
    this.authRepository.saveToken(token, userId);
  }

  public async decodeToken(token: string): Promise<ITokenPayload> {
    const secret = this.configService.get('JWT_REFRESH_SECRET');

    try {
      await this.jwtService.verifyAsync(token, { secret });
      return this.jwtService.decode(token) as ITokenPayload;
    } catch (e) {
      this.logger.error('Token is not valid');
    }
  }

  public createHash(password: string): string {
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

  public deleteToken(token: string): void {
    this.authRepository.deleteToken(token);
  }

  public async refreshToken(oldToken: string): Promise<ITokens> {
    await this.decodeToken(oldToken);
    await this.deleteToken(oldToken);

    const payload = await this.decodeToken(oldToken);

    if (!payload || !payload.id || !payload.nickname) {
      throw new UnauthorizedException('Token is not valid');
    }

    const { accessToken, refreshToken } = await this.createTokens(
      payload.id,
      payload.nickname,
    );

    const existingUser = await this.usersService.getUserById(payload.id);

    if (!existingUser) {
      throw new NotFoundException('User is not found');
    }

    await this.saveToken(refreshToken, existingUser.id);

    return {
      accessToken,
      refreshToken,
    };
  }
}
