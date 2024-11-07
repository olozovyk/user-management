import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';

import { AuthRepository } from './auth.repository';
import { UserService } from '@modules/user/services';
import { CreateUserDto, LoginDto } from './dto';
import { createHash } from '@common/utils';
import { User } from '@modules/user/entities';
import { EmailService } from './email.service';
import { ITokenPayload, ITokens } from './types';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UserService,
    private readonly emailService: EmailService,
  ) {}

  private EMAIL_SENDER = this.configService.getOrThrow('EMAIL_SENDER');
  private BASE_URL = this.configService.getOrThrow('BASE_URL');
  private BASE_URL_LOCAL = this.configService.getOrThrow('BASE_URL_LOCAL');

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

    const tokens = await this.createTokens({
      id: existingUser.id,
      email: existingUser.email,
      nickname: existingUser.nickname,
      role: existingUser.role,
    });

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

    if (
      !payload ||
      !payload.email ||
      !payload.id ||
      !payload.nickname ||
      !payload.role
    ) {
      throw new UnauthorizedException('Token is not valid');
    }

    const { accessToken, refreshToken } = await this.createTokens({
      id: payload.id,
      email: payload.email,
      nickname: payload.nickname,
      role: payload.role,
    });

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

  private async createTokens({
    id,
    email,
    nickname,
    role,
  }: ITokenPayload): Promise<ITokens> {
    const accessSecret = this.configService.get('JWT_ACCESS_SECRET');
    const accessTtl = this.configService.get('JWT_ACCESS_TTL');
    const refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
    const refreshTtl = this.configService.get('JWT_REFRESH_TTL');

    const accessToken = await this.jwtService.signAsync(
      { id, email, nickname, role },
      { secret: accessSecret, expiresIn: accessTtl },
    );

    const refreshToken = await this.jwtService.signAsync(
      { id, email, nickname, role },
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
    } catch {
      this.logger.error('Token is not valid');
    }
  }

  public async getUserByEmailVerificationToken(
    emailVerificationToken: string,
  ): Promise<User> {
    const user = await this.usersService.getUserByEmailVerificationToken(
      emailVerificationToken,
    );

    if (!user) {
      throw new BadRequestException('Provide a valid verification token');
    }

    return user;
  }

  public async sendVerificationEmail(
    userId: string,
    to: string,
  ): Promise<void> {
    const user = await this.usersService.getUserById(userId);

    if (user.verifiedEmail) {
      throw new BadRequestException('The email is already verified');
    }

    const URL =
      process.env.NODE_ENV === 'development'
        ? this.BASE_URL_LOCAL
        : this.BASE_URL;

    const token = randomUUID();

    const updateResult = await this.usersService.saveEmailVerificationToken(
      userId,
      token,
    );

    if (updateResult.affected === 0) {
      throw new InternalServerErrorException(
        'Failed to save email verification token in the database',
      );
    }

    try {
      const path = `auth/verify-email/${token}`;
      const message = `Please go to ${URL}${path} to verify your email.`;

      await this.emailService.send(this.EMAIL_SENDER, to, message);
    } catch {
      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }
  }

  public async setVerifiedEmail(userId: string): Promise<void> {
    const updateResult = await this.usersService.setVerifiedEmail(userId);

    if (updateResult.affected === 0) {
      throw new InternalServerErrorException(
        'Failed to update email verification status in the database',
      );
    }
  }
}
