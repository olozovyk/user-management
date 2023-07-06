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

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { mapUserOutput } from '../../common/utils';
import { CreateUserDto, LoginDto } from '../../common/dto';
import { IUser } from '../../common/types';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetUserResDto, LoginResDto } from '../../common/dto/openApi';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('signup')
  @ApiCreatedResponse({
    description: 'The User is created',
    type: GetUserResDto,
  })
  @ApiBadRequestResponse({ description: 'Such a nickname already in use.' })
  public async signup(
    @Body() body: CreateUserDto,
    @Res() res: Response<{ user: IUser }>,
  ) {
    const newUser = await this.usersService.createUser(body);

    res.set('Last-Modified', newUser.updatedAt.toUTCString());
    res.json({
      user: mapUserOutput(newUser),
    });
  }

  @Post('login')
  @ApiResponse({
    status: 200,
    description: 'Successful login',
    type: LoginResDto,
  })
  @ApiBadRequestResponse({ description: 'Login or password is not correct.' })
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
      user: mapUserOutput(user),
      token: accessToken,
    });
  }

  @Post('logout')
  @ApiNoContentResponse({ description: 'Logout successful' })
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Req() req: Request, @Res() res: Response) {
    await this.authService.deleteToken(req.cookies.token);
    res.clearCookie('token');
    res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refreshes a token pair' })
  @ApiOkResponse({ description: 'A token pair refreshed' })
  @ApiUnauthorizedResponse({ description: 'Token is not valid' })
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
