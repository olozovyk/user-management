import { Request, Response } from 'express';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';

import { CreateUserDto, LoginDto } from '../../common/dto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { IUser } from 'src/common/types';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('signup')
  public async signup(
    @Body() body: CreateUserDto,
    @Res() res: Response<{ user: IUser }>,
  ) {
    const newUser = await this.usersService.createUser(body);

    res.set('Last-Modified', newUser.updatedAt.toUTCString());
    res.json({
      user: {
        id: newUser.id,
        nickname: newUser.nickname,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      },
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() body: LoginDto,
    @Res() res: Response<{ user: IUser; token: string }>,
  ) {
    const {
      user,
      tokens: { accessToken, refreshToken },
    } = await this.authService.login(body);

    res.cookie('token', refreshToken, { httpOnly: true });
    res.set('Last-Modified', user.updatedAt.toUTCString());
    res.json({
      user: {
        id: user.id,
        nickname: user.nickname,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
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
  public async refresh(
    @Req() req: Request,
    @Res() res: Response<{ token: string }>,
  ) {
    const oldToken = req.cookies.token;

    const { accessToken, refreshToken } = await this.authService.refreshToken(
      oldToken,
    );

    res.cookie('token', refreshToken, { httpOnly: true });
    res.json({
      token: accessToken,
    });
  }
}
