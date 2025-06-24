import { Request, Response } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { join } from 'node:path';

import { AuthService } from './auth.service';
import { mapUserOutput } from '@common/utils';
import { CreateUserDto, LoginDto } from './dto';
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
import { IUser } from '@modules/user/types';
import { RequestWithTokenPayload } from './types';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly logger = new Logger(AuthController.name);

  /**
   * Create a new user
   */
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

    try {
      if (process.env.NODE_ENV !== 'test') {
        await this.authService.sendVerificationEmail(newUser.id, newUser.email);
      }
    } catch {
      this.logger.error('Failed to send verification email');
    }

    res.set('Last-Modified', newUser.updatedAt.toUTCString());
    res.json({
      user: mapUserOutput(newUser, true),
    });
  }

  /**
   * Login user
   */
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
      user: mapUserOutput(user, true),
      token: accessToken,
    });
  }

  /**
   * Logout user
   */
  @Post('logout')
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'Logout successful' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(
    @Req() req: Request & { cookies: { token: string } },
    @Res() res: Response,
  ) {
    await this.authService.deleteToken(req.cookies.token);
    res.clearCookie('token');
    res.sendStatus(HttpStatus.NO_CONTENT);
  }

  /**
   * Refresh token pair
   */
  @Post('refresh')
  @ApiOkResponse({ description: 'A token pair refreshed', type: RefreshApiDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Req() req: Request & { cookies: { token: string } },
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
   * Verify email
   */
  @Get('verify-email/:token')
  public async verifyEmail(
    @Param('token') token: string,
    @Res() res: Response,
  ) {
    const { id } =
      await this.authService.getUserByEmailVerificationToken(token);

    await this.authService.setVerifiedEmail(id);

    res.sendFile(
      join(__dirname, '../../../static', 'verification-success.html'),
    );
  }

  /**
   * Request a link to verify email
   */
  @Get('request-verification-link')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'A verification link has been sent' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({
    description: 'A verification link has not been sent',
  })
  @UseGuards(AuthGuard)
  public async sendEmailWithVerificationLink(
    @Req() req: RequestWithTokenPayload,
  ) {
    await this.authService.sendVerificationEmail(req.user.id, req.user.email);
    return { message: 'A verification link has been sent' };
  }
}
