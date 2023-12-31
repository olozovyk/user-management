import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthRepository } from './auth.repository';
import { ITokenPayload, ITokens, RoleType } from 'src/common/types';
import { UserService } from '@modules/user/user.service';
import { CreateUserDto, LoginDto } from './dto';
import { createHash } from '@common/utils';
import { User } from '@modules/user/entities';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UserService,
  ) {}

  public async signup(user: CreateUserDto): Promise<User> {
    const password = createHash(user.password);

    const userToCreate = {
      ...user,
      password,
    };

    const existingUser = await this.usersService.getUserByNickname(
      user.nickname,
    );

    if (existingUser) {
      throw new BadRequestException('Such a nickname already in use.');
    }

    return this.usersService.createUser(userToCreate);
  }

  public async login(body: LoginDto): Promise<{ user: User; tokens: ITokens }> {
    const existingUser = await this.usersService.getUserByNickname(
      body.nickname,
    );

    if (!existingUser) {
      throw new BadRequestException('Login or password is not correct');
    }

    const password = createHash(body.password);

    if (password !== existingUser.password) {
      throw new BadRequestException('Login or password is not correct');
    }

    const tokens = await this.createTokens(
      existingUser.id,
      existingUser.nickname,
      existingUser.role,
    );

    await this.saveToken(tokens.refreshToken, existingUser.id);

    return {
      user: existingUser,
      tokens,
    };
  }

  public async deleteToken(token: string): Promise<void> {
    await this.authRepository.deleteToken(token);
  }

  public async refreshToken(oldToken: string): Promise<ITokens> {
    await this.decodeToken(oldToken);
    await this.deleteToken(oldToken);

    const payload = await this.decodeToken(oldToken);

    if (!payload || !payload.id || !payload.nickname || !payload.role) {
      throw new UnauthorizedException('Token is not valid');
    }

    const { accessToken, refreshToken } = await this.createTokens(
      payload.id,
      payload.nickname,
      payload.role,
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

  private async createTokens(
    id: string,
    nickname: string,
    role: RoleType,
  ): Promise<ITokens> {
    const accessSecret = this.configService.get('JWT_ACCESS_SECRET');
    const accessTtl = this.configService.get('JWT_ACCESS_TTL');
    const refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
    const refreshTtl = this.configService.get('JWT_REFRESH_TTL');

    const accessToken = await this.jwtService.signAsync(
      { id, nickname, role },
      { secret: accessSecret, expiresIn: accessTtl },
    );

    const refreshToken = await this.jwtService.signAsync(
      { id, nickname, role },
      { secret: refreshSecret, expiresIn: refreshTtl },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  private async saveToken(token: string, userId: string): Promise<void> {
    await this.authRepository.saveToken(token, userId);
  }

  private async decodeToken(token: string): Promise<ITokenPayload | void> {
    const secret = this.configService.get('JWT_REFRESH_SECRET');

    try {
      await this.jwtService.verifyAsync(token, { secret });
      return this.jwtService.decode(token) as ITokenPayload;
    } catch (e) {
      this.logger.error('Token is not valid');
    }
  }
}
