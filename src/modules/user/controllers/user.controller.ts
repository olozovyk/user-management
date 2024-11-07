import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UserService } from '../services';
import { AuthGuard } from '@modules/auth/guards';
import {
  PermissionToChangeUserGuard,
  ProtectUserChangesByTimeGuard,
  UserExistingGuard,
} from '../guards';

import { mapUserOutput } from '@common/utils';
import { EditUserDto, VoteDto } from '../dto';
import {
  AvatarApiDto,
  FileUploadApiDto,
  GetUserApiDto,
} from '@modules/user/dto/api';
import { IUser } from '../types';
import { ITokenPayload } from '@modules/auth/types';
import { User } from '../entities';

@Controller('users')
@ApiTags('User')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Get user by ID
   */
  @Get(':id')
  @ApiOkResponse({ type: GetUserApiDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, UserExistingGuard)
  public async getUserById(
    // param is needed for swagger:
    @Param('id') id: string,
    @Req() req: Request & { user: User },
    @Res() res: Response<{ user: IUser }>,
  ) {
    // const user = await this.userService.getUserById(id);

    res.set('Last-Modified', req.user.updatedAt.toUTCString());
    res.json({
      user: mapUserOutput(req.user, true),
    });
  }

  /**
   * Edit user
   */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiHeader({
    name: 'If-Unmodified-Since',
    description: 'Last modified date',
    required: true,
  })
  @ApiOkResponse({ description: 'An updated user', type: GetUserApiDto })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @UseGuards(
    AuthGuard,
    UserExistingGuard,
    PermissionToChangeUserGuard,
    ProtectUserChangesByTimeGuard,
  )
  public async editUser(
    @Param('id') id: string,
    @Body() body: EditUserDto,
    @Req() req: Request & { user: ITokenPayload },
    @Res() res: Response<{ user: IUser }>,
  ) {
    const updatedUser = await this.userService.editUser(
      id,
      body,
      req.user.role,
    );

    if (!updatedUser) {
      throw new NotFoundException('User is not found');
    }

    res.set('Last-Modified', updatedUser.updatedAt.toUTCString());
    res.json({
      user: mapUserOutput(updatedUser, true),
    });
  }

  /**
   * Delete user
   */
  @Delete(':id')
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'User is deleted' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @UseGuards(AuthGuard, UserExistingGuard, PermissionToChangeUserGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteUser(@Param('id') id: string) {
    await this.userService.softDeleteUser(id);
  }

  // /**
  //  * Submit a vote for the user
  //  */
  // @Post(':id/rating')
  // @ApiBearerAuth()
  // @ApiHeader({
  //   name: 'If-Unmodified-Since',
  //   description: 'Last modified date',
  //   required: true,
  // })
  // @ApiParam({ name: 'id', description: 'User ID you vote for' })
  // @ApiOkResponse({ description: 'The vote is counted' })
  // @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  // @ApiBadRequestResponse({ description: 'Bad request' })
  // @ApiNotFoundResponse({ description: 'Not found' })
  // @UseGuards(AuthGuard, UserExistingGuard, ProtectUserChangesByTimeGuard)
  // @HttpCode(HttpStatus.OK)
  // public async vote(
  //   @Req() req: Request & { user: ITokenPayload },
  //   @Param('id') targetUserId: string,
  //   @Body() { vote }: VoteDto,
  // ) {
  //   const userId = req.user.id;
  //   await this.userService.vote(userId, targetUserId, vote);

  //   return {
  //     message: vote === 0 ? 'The vote is removed' : 'The vote is received',
  //   };
  // }

  /**
   * Submit a vote for the user
   */
  @Post(':nickname/rating')
  @ApiBearerAuth()
  @ApiHeader({
    name: 'If-Unmodified-Since',
    description: 'Last modified date',
    required: true,
  })
  @ApiParam({ name: 'id', description: 'User ID you vote for' })
  @ApiOkResponse({ description: 'The vote is counted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  public async vote(
    @Req() req: Request & { user: ITokenPayload },
    @Param('nickname') nickname: string,
    @Body() { vote }: VoteDto,
  ) {
    const userId = req.user.id;
    const targetUser = await this.userService.getUserByNickname(nickname);

    if (!targetUser) {
      throw new NotFoundException('User is not found');
    }

    await this.userService.vote(userId, targetUser.id, vote);

    return {
      message: vote === 0 ? 'The vote is removed' : 'The vote is received',
    };
  }

  /**
   * Upload user avatar
   */
  @Post(':id/avatar')
  @ApiBearerAuth()
  @ApiHeader({
    name: 'If-Unmodified-Since',
    description: 'Last modified date',
    required: true,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'jpeg, png, no large than 5MB',
    type: FileUploadApiDto,
  })
  @ApiCreatedResponse({ type: AvatarApiDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @UseGuards(
    AuthGuard,
    UserExistingGuard,
    PermissionToChangeUserGuard,
    ProtectUserChangesByTimeGuard,
  )
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 5,
          }),
          new FileTypeValidator({ fileType: 'image/(jpeg|png)' }),
        ],
      }),
    )
    avatar: Express.Multer.File,
  ): Promise<{ avatarUrl: string }> {
    const avatarUrl = await this.userService.uploadAvatar(id, avatar);

    return {
      avatarUrl,
    };
  }
}
