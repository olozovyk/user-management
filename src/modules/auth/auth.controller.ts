import { Request, Response } from 'express';
import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';

import { CreateUserDto, LoginDto } from '../../common/dto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from 'src/common/entities/user.entity';

@Controller('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('signup')
  public async signup(@Body() body: CreateUserDto, @Res() res: Response) {
    const password = this.authService.createHash(body.password);

    const user = {
      ...body,
      password,
    };

    const existingUser = await this.usersService.getUserByNickname(
      user.nickname,
    );

    if (existingUser) {
      throw new HttpException(
        'Such a nickname already in use.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newUser = await this.usersService.createUser(user);

    res.set('Last-Modified', newUser.updatedAt.toUTCString());
    res.json({
      user: {
        id: newUser.id,
        nickname: newUser.nickname,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() body: LoginDto, @Res() res: Response) {
    const existingUser = (await this.usersService.getUserByNickname(
      body.nickname,
    )) as User;

    if (!existingUser) {
      throw new HttpException(
        'User with such a nickname is not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const password = this.authService.createHash(body.password);

    if (password !== existingUser.password) {
      throw new HttpException(
        'Login or password is not correct',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { accessToken, refreshToken } = await this.authService.createTokens(
      existingUser.id,
      existingUser.nickname,
    );

    res.cookie('token', refreshToken, { httpOnly: true });
    await this.authService.saveToken(refreshToken, existingUser.id);

    res.set('Last-Modified', existingUser.updatedAt.toUTCString());
    res.json({
      user: {
        id: existingUser.id,
        nickname: existingUser.nickname,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
      },
      token: accessToken,
    });
  }

  @Post('logout')
  public async logout(@Req() req: Request, @Res() res: Response) {
    await this.authService.deleteToken(req.cookies.token);
    res.clearCookie('token');
    res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(@Req() req: Request, @Res() res: Response) {
    const oldToken = req.cookies.token;

    if (!oldToken) {
      throw new HttpException('Token is not provided', HttpStatus.BAD_REQUEST);
    }

    const payload = await this.authService.decodeToken(oldToken);

    if (!payload || !payload.id || !payload.nickname) {
      throw new HttpException('Token is not valid', HttpStatus.UNAUTHORIZED);
    }

    const { accessToken, refreshToken } = await this.authService.createTokens(
      payload.id,
      payload.nickname,
    );

    const existingUser = await this.usersService.getUserById(payload.id);

    if (!existingUser) {
      throw new HttpException('User is not found', HttpStatus.NOT_FOUND);
    }

    res.cookie('token', refreshToken, { httpOnly: true });
    await this.authService.saveToken(refreshToken, existingUser.id);

    res.json({
      token: accessToken,
    });
  }
}
