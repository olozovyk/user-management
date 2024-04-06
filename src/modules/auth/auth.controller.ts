import { Request, Response } from 'express';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { mapUserOutput } from '@common/utils';
import { CreateUserDto, LoginDto } from './dto';
import { ITokenPayload, IUser } from '@common/types';
import { User } from '@common/decorators';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from './guards';
import { RefreshApiDto, LoginApiDto } from '@modules/auth/dto/api';
import { GetUserApiDto } from '@modules/user/dto/api';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*
   * Create a new user
   * */
  @Post('signup')
  @ApiCreatedResponse({
    description: 'The User is created',
    type: GetUserApiDto,
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
  public async signup(
    @Body() body: CreateUserDto,
    @Res() res: Response<{ user: IUser }>,
  ) {
    const newUser = await this.authService.signup(body);

    res.set('Last-Modified', newUser.updatedAt.toUTCString());
    res.json({
      user: mapUserOutput(newUser),
    });
  }

  /*
   * Login user
   * */
  @Post('login')
  @ApiOkResponse({
    description: 'Successful login',
    type: LoginApiDto,
  })
  @ApiBadRequestResponse({ description: 'Bad request' })
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

  /*
   * Logout user
   * */
  @Post('logout')
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'Logout successful' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Req() req: Request, @Res() res: Response) {
    await this.authService.deleteToken(req.cookies.token);
    res.clearCookie('token');
    res.sendStatus(HttpStatus.NO_CONTENT);
  }

  /*
   * Refresh token pair
   * */
  @Post('refresh')
  @ApiOkResponse({ description: 'A token pair refreshed', type: RefreshApiDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Req() req: Request,
    @Res() res: Response<{ token: string }>,
  ) {
    const oldToken = req.cookies.token;

    const { accessToken, refreshToken } =
      await this.authService.refreshToken(oldToken);

    res.cookie('token', refreshToken, { httpOnly: true });
    res.json({
      token: accessToken,
    });
  }

  /**
   * Send a link to verify email
   */
  @Post('send-verification-link')
  @ApiOkResponse({ description: 'A verification link has been sent' })
  @ApiInternalServerErrorResponse({
    description: 'A verification link has not been sent',
  })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  public async sendEmailWithVerificationLink(@User() user: ITokenPayload) {
    const result = await this.authService.sendVerificationEmail(
      user.id,
      user.email,
    );

    if (!result) {
      throw new InternalServerErrorException(
        'A verification link has not been sent',
      );
    }

    return { message: 'A verification link has been sent' };
  }
}
