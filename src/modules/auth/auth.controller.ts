import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { CreateUserDto } from '../../dto/createUser.dto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../../dto/login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('signup')
  async signup(@Body() body: CreateUserDto) {
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

    return {
      statusCode: 201,
      user: {
        id: newUser.id,
        nickname: newUser.nickname,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto, @Res() res: Response) {
    const existingUser = (await this.usersService.getUserByNickname(
      body.nickname,
    )) as CreateUserDto & { id: number };

    if (!existingUser) {
      throw new HttpException(
        'User with such a nickname is does not exist',
        HttpStatus.NOT_FOUND,
      );
    }

    const password = this.authService.createHash(body.password);

    if (password !== existingUser.password) {
      throw new HttpException(
        'Password is not correct',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { accessToken, refreshToken } = await this.authService.createTokens(
      existingUser.id,
      existingUser.nickname,
    );

    res.cookie('token', refreshToken);
    await this.authService.saveToken(refreshToken, existingUser.id);

    res.json({
      statusCode: 200,
      user: {
        nickname: existingUser.nickname,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
      },
      token: accessToken,
    });
  }
}
